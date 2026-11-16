package com.smartqueue.service;

import com.smartqueue.dto.response.DashboardSummaryResponse;
import com.smartqueue.dto.response.ServiceResponse;
import com.smartqueue.dto.response.StaffDashboardResponse;
import com.smartqueue.dto.response.TokenResponse;
import com.smartqueue.entity.QueueToken;
import com.smartqueue.entity.StaffServiceAssignment;
import com.smartqueue.entity.User;
import com.smartqueue.enums.TokenStatus;
import com.smartqueue.exception.ResourceNotFoundException;
import com.smartqueue.repository.CustomerRepository;
import com.smartqueue.repository.QueueTokenRepository;
import com.smartqueue.repository.ServiceRepository;
import com.smartqueue.repository.StaffServiceAssignmentRepository;
import com.smartqueue.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final QueueTokenRepository tokenRepository;
    private final CustomerRepository customerRepository;
    private final ServiceRepository serviceRepository;
    private final UserRepository userRepository;
    private final StaffServiceAssignmentRepository assignmentRepository;
    private final ServiceManagementService serviceManagementService;
    private final QueueService queueService;

    public AnalyticsService(QueueTokenRepository tokenRepository,
                            CustomerRepository customerRepository,
                            ServiceRepository serviceRepository,
                            UserRepository userRepository,
                            StaffServiceAssignmentRepository assignmentRepository,
                            ServiceManagementService serviceManagementService,
                            QueueService queueService) {
        this.tokenRepository = tokenRepository;
        this.customerRepository = customerRepository;
        this.serviceRepository = serviceRepository;
        this.userRepository = userRepository;
        this.assignmentRepository = assignmentRepository;
        this.serviceManagementService = serviceManagementService;
        this.queueService = queueService;
    }

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getAdminDashboardSummary() {
        DashboardSummaryResponse summary = new DashboardSummaryResponse();

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);

        summary.setTotalCustomers(customerRepository.count());
        summary.setTotalTokensGenerated(tokenRepository.count());
        summary.setCurrentlyWaiting(tokenRepository.countByStatus(TokenStatus.WAITING));
        summary.setCurrentlyServing(tokenRepository.countByStatus(TokenStatus.SERVING));
        summary.setCompletedToday(tokenRepository.countByStatusAndCompletedAtBetween(TokenStatus.COMPLETED, startOfDay, endOfDay));
        summary.setCancelledToday(tokenRepository.countByStatusAndCancelledAtBetween(TokenStatus.CANCELLED, startOfDay, endOfDay));

        // Calculate average waiting time from completed tokens today
        List<QueueToken> todayTokens = tokenRepository.findAll().stream()
                .filter(t -> t.getCalledAt() != null && t.getCreatedAt().isAfter(startOfDay))
                .collect(Collectors.toList());

        if (!todayTokens.isEmpty()) {
            double avgMinutes = todayTokens.stream()
                    .mapToLong(t -> java.time.Duration.between(t.getCreatedAt(), t.getCalledAt()).toMinutes())
                    .average()
                    .orElse(0.0);
            summary.setAvgWaitTimeMinutes(Math.round(avgMinutes * 10.0) / 10.0);
        } else {
            summary.setAvgWaitTimeMinutes(0.0);
        }

        // Service summaries
        List<ServiceResponse> serviceSummaries = serviceManagementService.getAllServices();
        summary.setServiceSummaries(serviceSummaries);

        // Grouped by status
        Map<String, Long> statusMap = new LinkedHashMap<>();
        for (TokenStatus status : TokenStatus.values()) {
            statusMap.put(status.name(), tokenRepository.countByStatus(status));
        }
        summary.setTokensByStatus(statusMap);

        // Grouped by service
        Map<String, Long> serviceMap = new LinkedHashMap<>();
        List<Object[]> serviceCounts = tokenRepository.countTokensGroupedByService();
        for (Object[] row : serviceCounts) {
            serviceMap.put((String) row[0], (Long) row[1]);
        }
        summary.setTokensByService(serviceMap);

        // Recent 10 tokens
        List<TokenResponse> recentTokens = tokenRepository.findTop10ByOrderByCreatedAtDesc().stream()
                .map(queueService::mapToTokenResponse)
                .collect(Collectors.toList());
        summary.setRecentTokens(recentTokens);

        return summary;
    }

    @Transactional(readOnly = true)
    public StaffDashboardResponse getStaffDashboard(Long staffUserId) {
        User staff = userRepository.findById(staffUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff user", "id", staffUserId));

        StaffDashboardResponse response = new StaffDashboardResponse();
        response.setStaffId(staff.getId());
        response.setStaffName(staff.getFullName());

        List<StaffServiceAssignment> assignments = assignmentRepository.findByUserId(staffUserId);
        List<ServiceResponse> assignedServices = assignments.stream()
                .map(a -> serviceManagementService.mapToResponse(a.getService()))
                .collect(Collectors.toList());

        // If staff is not explicitly assigned to any specific service, give all active services
        if (assignedServices.isEmpty()) {
            assignedServices = serviceManagementService.getActiveServices();
        }
        response.setAssignedServices(assignedServices);

        // Check if currently serving
        queueService.getServingTokenForStaff(staffUserId).ifPresent(response::setCurrentlyServingToken);

        // Gather waiting tokens for assigned services
        List<TokenResponse> waitingTokens = new ArrayList<>();
        long totalWaiting = 0;
        for (ServiceResponse s : assignedServices) {
            List<TokenResponse> tokens = queueService.getWaitingQueue(s.getId());
            waitingTokens.addAll(tokens);
            totalWaiting += tokens.size();
        }
        response.setWaitingTokens(waitingTokens);
        response.setTotalWaiting(totalWaiting);

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        response.setCompletedToday(tokenRepository.countByStatusAndCompletedAtBetween(TokenStatus.COMPLETED, startOfDay, endOfDay));
        response.setCancelledToday(tokenRepository.countByStatusAndCancelledAtBetween(TokenStatus.CANCELLED, startOfDay, endOfDay));

        return response;
    }
}
