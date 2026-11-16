package com.smartqueue.controller;

import com.smartqueue.dto.request.CallNextRequest;
import com.smartqueue.dto.request.CancelTokenRequest;
import com.smartqueue.dto.response.StaffDashboardResponse;
import com.smartqueue.dto.response.TokenResponse;
import com.smartqueue.security.CustomUserDetails;
import com.smartqueue.service.AnalyticsService;
import com.smartqueue.service.QueueService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/staff")
@PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
public class StaffController {

    private final QueueService queueService;
    private final AnalyticsService analyticsService;

    public StaffController(QueueService queueService, AnalyticsService analyticsService) {
        this.queueService = queueService;
        this.analyticsService = analyticsService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<StaffDashboardResponse> getStaffDashboard(@AuthenticationPrincipal CustomUserDetails userDetails) {
        StaffDashboardResponse response = analyticsService.getStaffDashboard(userDetails.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/queue")
    public ResponseEntity<List<TokenResponse>> getWaitingQueue(@RequestParam(required = false) Long serviceId) {
        if (serviceId != null) {
            return ResponseEntity.ok(queueService.getWaitingQueue(serviceId));
        }
        return ResponseEntity.ok(List.of());
    }

    @PostMapping("/queue/call-next")
    public ResponseEntity<TokenResponse> callNextCustomer(
            @Valid @RequestBody CallNextRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        TokenResponse response = queueService.callNext(request.getServiceId(), userDetails.getId(), request.getCounterName());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/tokens/{id}/complete")
    public ResponseEntity<TokenResponse> completeService(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        TokenResponse response = queueService.completeService(id, userDetails.getId());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/tokens/{id}/cancel")
    public ResponseEntity<TokenResponse> cancelToken(
            @PathVariable Long id,
            @RequestBody(required = false) CancelTokenRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        String reason = (request != null) ? request.getReason() : null;
        TokenResponse response = queueService.cancelToken(id, userDetails.getId(), reason);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/current-serving")
    public ResponseEntity<TokenResponse> getCurrentServing(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return queueService.getServingTokenForStaff(userDetails.getId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }
}
