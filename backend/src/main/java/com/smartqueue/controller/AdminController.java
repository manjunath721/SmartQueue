package com.smartqueue.controller;

import com.smartqueue.dto.request.RegisterRequest;
import com.smartqueue.dto.request.StaffAssignmentRequest;
import com.smartqueue.dto.response.*;
import com.smartqueue.entity.Customer;
import com.smartqueue.enums.TokenStatus;
import com.smartqueue.repository.CustomerRepository;
import com.smartqueue.service.AnalyticsService;
import com.smartqueue.service.AuthService;
import com.smartqueue.service.QueueService;
import com.smartqueue.service.ServiceManagementService;
import com.smartqueue.service.StaffService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AnalyticsService analyticsService;
    private final QueueService queueService;
    private final StaffService staffService;
    private final AuthService authService;
    private final ServiceManagementService serviceManagementService;
    private final CustomerRepository customerRepository;

    public AdminController(AnalyticsService analyticsService,
                           QueueService queueService,
                           StaffService staffService,
                           AuthService authService,
                           ServiceManagementService serviceManagementService,
                           CustomerRepository customerRepository) {
        this.analyticsService = analyticsService;
        this.queueService = queueService;
        this.staffService = staffService;
        this.authService = authService;
        this.serviceManagementService = serviceManagementService;
        this.customerRepository = customerRepository;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardSummaryResponse> getAdminDashboard() {
        DashboardSummaryResponse summary = analyticsService.getAdminDashboardSummary();
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/customers")
    public ResponseEntity<Page<Customer>> getCustomers(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        if (keyword != null && !keyword.isBlank()) {
            return ResponseEntity.ok(customerRepository.searchCustomers(keyword.trim(), pageable));
        }
        return ResponseEntity.ok(customerRepository.findAll(pageable));
    }

    @GetMapping("/tokens")
    public ResponseEntity<Page<TokenResponse>> getTokens(
            @RequestParam(required = false) Long serviceId,
            @RequestParam(required = false) TokenStatus status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<TokenResponse> tokens = queueService.filterTokens(serviceId, status, keyword, pageable);
        return ResponseEntity.ok(tokens);
    }

    @GetMapping("/staff")
    public ResponseEntity<Page<UserResponse>> getStaff(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").ascending());
        Page<UserResponse> staffPage = staffService.searchStaff(keyword, pageable);
        return ResponseEntity.ok(staffPage);
    }

    @PostMapping("/staff")
    public ResponseEntity<UserResponse> createStaff(@Valid @RequestBody RegisterRequest request) {
        if (request.getRole() == null || request.getRole().isBlank()) {
            request.setRole("ROLE_STAFF");
        }
        UserResponse response = authService.register(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/staff/{id}/toggle-status")
    public ResponseEntity<ApiResponse> toggleStaffStatus(@PathVariable Long id) {
        staffService.toggleUserActive(id);
        return ResponseEntity.ok(new ApiResponse(true, "Staff account status toggled successfully"));
    }

    @PostMapping("/staff/assign")
    public ResponseEntity<ApiResponse> assignStaffToService(@Valid @RequestBody StaffAssignmentRequest request) {
        serviceManagementService.assignStaffToService(request);
        return ResponseEntity.ok(new ApiResponse(true, "Staff assigned to service successfully"));
    }

    @DeleteMapping("/staff/{userId}/assign/{serviceId}")
    public ResponseEntity<ApiResponse> removeStaffAssignment(@PathVariable Long userId, @PathVariable Long serviceId) {
        serviceManagementService.removeStaffAssignment(userId, serviceId);
        return ResponseEntity.ok(new ApiResponse(true, "Staff assignment removed successfully"));
    }
}
