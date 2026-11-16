package com.smartqueue.service;

import com.smartqueue.dto.response.UserResponse;
import com.smartqueue.entity.StaffServiceAssignment;
import com.smartqueue.entity.User;
import com.smartqueue.enums.RoleType;
import com.smartqueue.exception.ResourceNotFoundException;
import com.smartqueue.repository.StaffServiceAssignmentRepository;
import com.smartqueue.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StaffService {

    private final UserRepository userRepository;
    private final StaffServiceAssignmentRepository assignmentRepository;
    private final ServiceManagementService serviceManagementService;

    public StaffService(UserRepository userRepository,
                        StaffServiceAssignmentRepository assignmentRepository,
                        ServiceManagementService serviceManagementService) {
        this.userRepository = userRepository;
        this.assignmentRepository = assignmentRepository;
        this.serviceManagementService = serviceManagementService;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllStaff() {
        return userRepository.findAll().stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> searchStaff(String keyword, Pageable pageable) {
        if (keyword != null && !keyword.isBlank()) {
            return userRepository.searchUsers(keyword.trim(), pageable).map(this::mapToUserResponse);
        }
        return userRepository.findAll(pageable).map(this::mapToUserResponse);
    }

    @Transactional(readOnly = true)
    public UserResponse getStaffById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return mapToUserResponse(user);
    }

    @Transactional
    public void toggleUserActive(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        user.setActive(!user.isActive());
        userRepository.save(user);
    }

    public UserResponse mapToUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setPhone(user.getPhone());
        response.setActive(user.isActive());
        response.setRoles(user.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toList()));
        response.setCreatedAt(user.getCreatedAt());

        List<StaffServiceAssignment> assignments = assignmentRepository.findByUserId(user.getId());
        response.setAssignedServices(assignments.stream()
                .map(a -> serviceManagementService.mapToResponse(a.getService()))
                .collect(Collectors.toList()));

        return response;
    }
}
