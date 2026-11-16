package com.smartqueue.service;

import com.smartqueue.dto.request.CreateTokenRequest;
import com.smartqueue.dto.response.CustomerTokenTrackingResponse;
import com.smartqueue.dto.response.QueueDisplayResponse;
import com.smartqueue.dto.response.TokenResponse;
import com.smartqueue.entity.*;
import com.smartqueue.enums.TokenStatus;
import com.smartqueue.exception.QueueException;
import com.smartqueue.exception.ResourceNotFoundException;
import com.smartqueue.repository.CustomerRepository;
import com.smartqueue.repository.QueueCounterRepository;
import com.smartqueue.repository.QueueTokenRepository;
import com.smartqueue.repository.ServiceRepository;
import com.smartqueue.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class QueueService {

    private final QueueTokenRepository tokenRepository;
    private final ServiceRepository serviceRepository;
    private final CustomerRepository customerRepository;
    private final QueueCounterRepository counterRepository;
    private final UserRepository userRepository;

    public QueueService(QueueTokenRepository tokenRepository,
                        ServiceRepository serviceRepository,
                        CustomerRepository customerRepository,
                        QueueCounterRepository counterRepository,
                        UserRepository userRepository) {
        this.tokenRepository = tokenRepository;
        this.serviceRepository = serviceRepository;
        this.customerRepository = customerRepository;
        this.counterRepository = counterRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public TokenResponse generateToken(CreateTokenRequest request) {
        ServiceEntity service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service", "id", request.getServiceId()));

        if (!service.isActive()) {
            throw new QueueException("Service '" + service.getName() + "' is currently inactive and not accepting tokens");
        }

        // Upsert customer by phone
        Customer customer = customerRepository.findByPhone(request.getCustomerPhone().trim())
                .map(existing -> {
                    existing.setName(request.getCustomerName().trim());
                    if (request.getCustomerEmail() != null && !request.getCustomerEmail().isBlank()) {
                        existing.setEmail(request.getCustomerEmail().trim());
                    }
                    return customerRepository.save(existing);
                })
                .orElseGet(() -> {
                    Customer newCustomer = new Customer(
                            request.getCustomerName().trim(),
                            request.getCustomerPhone().trim(),
                            request.getCustomerEmail() != null ? request.getCustomerEmail().trim() : null
                    );
                    return customerRepository.save(newCustomer);
                });

        // Concurrency-safe sequential token allocation using row-level locking
        LocalDate today = LocalDate.now();
        QueueCounter counter = getOrCreateCounterWithLock(service, today);

        int nextSequence = counter.getLastTokenNumber() + 1;
        counter.setLastTokenNumber(nextSequence);
        counterRepository.save(counter);

        // Format token number: e.g. A-101, B-102
        String formattedTokenNumber = String.format("%s-%03d", service.getPrefix(), nextSequence);

        // Secure unguessable tracking ID
        String trackingId = "tr_" + UUID.randomUUID().toString().replace("-", "");

        QueueToken token = new QueueToken(formattedTokenNumber, nextSequence, trackingId, service, customer);
        token.setStatus(TokenStatus.WAITING);

        QueueToken savedToken = tokenRepository.save(token);

        TokenResponse response = mapToTokenResponse(savedToken);
        long waitingAhead = tokenRepository.countWaitingAhead(service.getId(), nextSequence);
        response.setWaitingAhead(waitingAhead);
        response.setEstimatedWaitMinutes((int) ((waitingAhead + 1) * service.getAvgDurationMinutes()));

        return response;
    }

    private synchronized QueueCounter getOrCreateCounterWithLock(ServiceEntity service, LocalDate date) {
        Optional<QueueCounter> locked = counterRepository.findByServiceIdAndCounterDateForUpdate(service.getId(), date);
        if (locked.isPresent()) {
            return locked.get();
        }

        try {
            QueueCounter newCounter = new QueueCounter(service, date, 100);
            return counterRepository.saveAndFlush(newCounter);
        } catch (Exception ex) {
            return counterRepository.findByServiceIdAndCounterDateForUpdate(service.getId(), date)
                    .orElseGet(() -> counterRepository.findByServiceIdAndCounterDate(service.getId(), date)
                            .orElse(new QueueCounter(service, date, 100)));
        }
    }

    @Transactional(readOnly = true)
    public CustomerTokenTrackingResponse trackToken(String trackingId) {
        QueueToken token = tokenRepository.findByTrackingId(trackingId)
                .orElseThrow(() -> new ResourceNotFoundException("Queue token", "tracking reference", trackingId));

        CustomerTokenTrackingResponse response = new CustomerTokenTrackingResponse();
        response.setTrackingId(token.getTrackingId());
        response.setTokenNumber(token.getTokenNumber());
        response.setCustomerName(token.getCustomer().getName());
        response.setServiceName(token.getService().getName());
        response.setServicePrefix(token.getService().getPrefix());
        response.setStatus(token.getStatus());
        response.setCounterName(token.getCounterName());
        response.setCreatedAt(token.getCreatedAt());
        response.setCalledAt(token.getCalledAt());
        response.setCompletedAt(token.getCompletedAt());

        // Find currently serving token for this service
        tokenRepository.findFirstByServiceIdAndStatusOrderByCalledAtDesc(token.getService().getId(), TokenStatus.SERVING)
                .ifPresent(serving -> response.setCurrentlyServingToken(serving.getTokenNumber()));

        if (token.getStatus() == TokenStatus.WAITING) {
            long peopleAhead = tokenRepository.countWaitingAhead(token.getService().getId(), token.getSequenceNumber());
            response.setPeopleAhead(peopleAhead);
            response.setEstimatedWaitMinutes((int) ((peopleAhead + 1) * token.getService().getAvgDurationMinutes()));
        } else if (token.getStatus() == TokenStatus.SERVING) {
            response.setPeopleAhead(0);
            response.setEstimatedWaitMinutes(0);
        } else {
            response.setPeopleAhead(0);
            response.setEstimatedWaitMinutes(0);
        }

        return response;
    }

    @Transactional
    public TokenResponse callNext(Long serviceId, Long staffUserId, String counterName) {
        User staffUser = userRepository.findById(staffUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff user", "id", staffUserId));

        // Enforce: staff member cannot call a new customer while already actively serving one
        Optional<QueueToken> currentlyServing = tokenRepository.findFirstByServedByIdAndStatus(staffUserId, TokenStatus.SERVING);
        if (currentlyServing.isPresent()) {
            throw new QueueException("You are currently serving token " + currentlyServing.get().getTokenNumber() +
                    ". Please complete or cancel it before calling the next customer.");
        }

        // Pessimistic write lock on earliest WAITING token in FIFO order
        List<QueueToken> waiting = tokenRepository.findNextWaitingTokensForUpdate(serviceId, PageRequest.of(0, 1));
        if (waiting.isEmpty()) {
            throw new QueueException("No customers waiting in the queue for this service.");
        }

        QueueToken nextToken = waiting.get(0);
        nextToken.setStatus(TokenStatus.SERVING);
        nextToken.setServedBy(staffUser);
        nextToken.setCalledAt(LocalDateTime.now());
        if (counterName != null && !counterName.isBlank()) {
            nextToken.setCounterName(counterName);
        }

        QueueToken updated = tokenRepository.save(nextToken);
        return mapToTokenResponse(updated);
    }

    @Transactional
    public TokenResponse completeService(Long tokenId, Long staffUserId) {
        QueueToken token = tokenRepository.findById(tokenId)
                .orElseThrow(() -> new ResourceNotFoundException("Queue token", "id", tokenId));

        if (token.getStatus() != TokenStatus.SERVING) {
            throw new QueueException("Only tokens in 'SERVING' status can be marked as completed. Current status: " + token.getStatus());
        }

        token.setStatus(TokenStatus.COMPLETED);
        token.setCompletedAt(LocalDateTime.now());

        QueueToken updated = tokenRepository.save(token);
        return mapToTokenResponse(updated);
    }

    @Transactional
    public TokenResponse cancelToken(Long tokenId, Long staffUserId, String reason) {
        QueueToken token = tokenRepository.findById(tokenId)
                .orElseThrow(() -> new ResourceNotFoundException("Queue token", "id", tokenId));

        if (token.getStatus() == TokenStatus.COMPLETED) {
            throw new QueueException("Completed tokens cannot be cancelled.");
        }
        if (token.getStatus() == TokenStatus.CANCELLED) {
            throw new QueueException("Token is already cancelled.");
        }

        token.setStatus(TokenStatus.CANCELLED);
        token.setCancelledAt(LocalDateTime.now());
        token.setCancellationReason(reason != null && !reason.isBlank() ? reason.trim() : "Cancelled by staff/customer");

        QueueToken updated = tokenRepository.save(token);
        return mapToTokenResponse(updated);
    }

    @Transactional(readOnly = true)
    public List<TokenResponse> getWaitingQueue(Long serviceId) {
        return tokenRepository.findByServiceIdAndStatusOrderBySequenceNumberAsc(serviceId, TokenStatus.WAITING)
                .stream()
                .map(this::mapToTokenResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<TokenResponse> getServingTokenForStaff(Long staffUserId) {
        return tokenRepository.findFirstByServedByIdAndStatus(staffUserId, TokenStatus.SERVING)
                .map(this::mapToTokenResponse);
    }

    @Transactional(readOnly = true)
    public Optional<TokenResponse> getServingTokenForService(Long serviceId) {
        return tokenRepository.findFirstByServiceIdAndStatusOrderByCalledAtDesc(serviceId, TokenStatus.SERVING)
                .map(this::mapToTokenResponse);
    }

    @Transactional(readOnly = true)
    public Page<TokenResponse> filterTokens(Long serviceId, TokenStatus status, String keyword, Pageable pageable) {
        String cleanKeyword = (keyword != null && !keyword.isBlank()) ? keyword.trim() : null;
        return tokenRepository.filterTokens(serviceId, status, cleanKeyword, pageable)
                .map(this::mapToTokenResponse);
    }

    @Transactional(readOnly = true)
    public List<QueueDisplayResponse> getQueueDisplayBoard() {
        List<ServiceEntity> activeServices = serviceRepository.findByActiveTrueOrderByNameAsc();

        return activeServices.stream().map(service -> {
            QueueDisplayResponse display = new QueueDisplayResponse();
            display.setServiceId(service.getId());
            display.setServiceName(service.getName());
            display.setServicePrefix(service.getPrefix());

            tokenRepository.findFirstByServiceIdAndStatusOrderByCalledAtDesc(service.getId(), TokenStatus.SERVING)
                    .ifPresent(serving -> {
                        display.setCurrentlyServingToken(serving.getTokenNumber());
                        display.setCounterName(serving.getCounterName());
                    });

            List<QueueToken> nextTokens = tokenRepository.findTop5ByServiceIdAndStatusOrderBySequenceNumberAsc(
                    service.getId(), TokenStatus.WAITING);
            display.setNextWaitingTokens(nextTokens.stream().map(QueueToken::getTokenNumber).collect(Collectors.toList()));
            display.setWaitingCount(tokenRepository.countByServiceIdAndStatus(service.getId(), TokenStatus.WAITING));

            return display;
        }).collect(Collectors.toList());
    }

    public TokenResponse mapToTokenResponse(QueueToken token) {
        TokenResponse res = new TokenResponse();
        res.setId(token.getId());
        res.setTokenNumber(token.getTokenNumber());
        res.setSequenceNumber(token.getSequenceNumber());
        res.setTrackingId(token.getTrackingId());
        res.setServiceId(token.getService().getId());
        res.setServiceName(token.getService().getName());
        res.setServiceCode(token.getService().getCode());
        res.setCustomerId(token.getCustomer().getId());
        res.setCustomerName(token.getCustomer().getName());
        res.setCustomerPhone(token.getCustomer().getPhone());
        res.setStatus(token.getStatus());
        if (token.getServedBy() != null) {
            res.setServedByUsername(token.getServedBy().getUsername());
        }
        res.setCounterName(token.getCounterName());
        res.setCreatedAt(token.getCreatedAt());
        res.setCalledAt(token.getCalledAt());
        res.setCompletedAt(token.getCompletedAt());
        res.setCancelledAt(token.getCancelledAt());
        res.setCancellationReason(token.getCancellationReason());
        return res;
    }
}
