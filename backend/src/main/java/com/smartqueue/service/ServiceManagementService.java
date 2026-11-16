package com.smartqueue.service;

import com.smartqueue.dto.request.ServiceRequest;
import com.smartqueue.dto.request.StaffAssignmentRequest;
import com.smartqueue.dto.response.ServiceResponse;
import com.smartqueue.entity.QueueToken;
import com.smartqueue.entity.ServiceEntity;
import com.smartqueue.entity.StaffServiceAssignment;
import com.smartqueue.entity.User;
import com.smartqueue.enums.TokenStatus;
import com.smartqueue.exception.QueueException;
import com.smartqueue.exception.ResourceNotFoundException;
import com.smartqueue.repository.QueueTokenRepository;
import com.smartqueue.repository.ServiceRepository;
import com.smartqueue.repository.StaffServiceAssignmentRepository;
import com.smartqueue.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ServiceManagementService {

    private final ServiceRepository serviceRepository;
    private final QueueTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final StaffServiceAssignmentRepository assignmentRepository;

    public ServiceManagementService(ServiceRepository serviceRepository,
                                  QueueTokenRepository tokenRepository,
                                  UserRepository userRepository,
                                  StaffServiceAssignmentRepository assignmentRepository) {
        this.serviceRepository = serviceRepository;
        this.tokenRepository = tokenRepository;
        this.userRepository = userRepository;
        this.assignmentRepository = assignmentRepository;
    }

    @Transactional(readOnly = true)
    public List<ServiceResponse> getAllServices() {
        return serviceRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ServiceResponse> getActiveServices() {
        return serviceRepository.findByActiveTrueOrderByNameAsc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ServiceResponse getServiceById(Long id) {
        ServiceEntity service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service", "id", id));
        return mapToResponse(service);
    }

    @Transactional
    public ServiceResponse createService(ServiceRequest request) {
        if (serviceRepository.existsByNameIgnoreCase(request.getName())) {
            throw new QueueException("Service with name '" + request.getName() + "' already exists");
        }
        if (serviceRepository.existsByCodeIgnoreCase(request.getCode())) {
            throw new QueueException("Service with code '" + request.getCode() + "' already exists");
        }

        ServiceEntity service = new ServiceEntity(
                request.getName().trim(),
                request.getCode().trim().toUpperCase(),
                request.getPrefix().trim().toUpperCase(),
                request.getDescription(),
                request.getAvgDurationMinutes()
        );
        if (request.getActive() != null) {
            service.setActive(request.getActive());
        }

        ServiceEntity saved = serviceRepository.save(service);
        return mapToResponse(saved);
    }

    @Transactional
    public ServiceResponse updateService(Long id, ServiceRequest request) {
        ServiceEntity service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service", "id", id));

        // Validate unique name if changed
        if (!service.getName().equalsIgnoreCase(request.getName()) &&
                serviceRepository.existsByNameIgnoreCase(request.getName())) {
            throw new QueueException("Service with name '" + request.getName() + "' already exists");
        }

        // Validate unique code if changed
        if (!service.getCode().equalsIgnoreCase(request.getCode()) &&
                serviceRepository.existsByCodeIgnoreCase(request.getCode())) {
            throw new QueueException("Service with code '" + request.getCode() + "' already exists");
        }

        service.setName(request.getName().trim());
        service.setCode(request.getCode().trim().toUpperCase());
        service.setPrefix(request.getPrefix().trim().toUpperCase());
        service.setDescription(request.getDescription());
        if (request.getAvgDurationMinutes() != null) {
            service.setAvgDurationMinutes(request.getAvgDurationMinutes());
        }
        if (request.getActive() != null) {
            service.setActive(request.getActive());
        }

        ServiceEntity updated = serviceRepository.save(service);
        return mapToResponse(updated);
    }

    @Transactional
    public void toggleServiceStatus(Long id) {
        ServiceEntity service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service", "id", id));
        service.setActive(!service.isActive());
        serviceRepository.save(service);
    }

    @Transactional
    public void assignStaffToService(StaffAssignmentRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getUserId()));
        ServiceEntity service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service", "id", request.getServiceId()));

        Optional<StaffServiceAssignment> existing = assignmentRepository.findByUserIdAndServiceId(user.getId(), service.getId());
        if (existing.isPresent()) {
            StaffServiceAssignment assignment = existing.get();
            assignment.setCounterName(request.getCounterName());
            assignmentRepository.save(assignment);
        } else {
            StaffServiceAssignment assignment = new StaffServiceAssignment(user, service, request.getCounterName());
            assignmentRepository.save(assignment);
        }
    }

    @Transactional
    public void removeStaffAssignment(Long userId, Long serviceId) {
        assignmentRepository.deleteByUserIdAndServiceId(userId, serviceId);
    }

    public ServiceResponse mapToResponse(ServiceEntity service) {
        ServiceResponse response = new ServiceResponse();
        response.setId(service.getId());
        response.setName(service.getName());
        response.setCode(service.getCode());
        response.setPrefix(service.getPrefix());
        response.setDescription(service.getDescription());
        response.setAvgDurationMinutes(service.getAvgDurationMinutes());
        response.setActive(service.isActive());

        long waiting = tokenRepository.countByServiceIdAndStatus(service.getId(), TokenStatus.WAITING);
        long serving = tokenRepository.countByServiceIdAndStatus(service.getId(), TokenStatus.SERVING);
        response.setWaitingCount(waiting);
        response.setServingCount(serving);

        tokenRepository.findFirstByServiceIdAndStatusOrderByCalledAtDesc(service.getId(), TokenStatus.SERVING)
                .ifPresent(qt -> response.setCurrentlyServingToken(qt.getTokenNumber()));

        return response;
    }
}
