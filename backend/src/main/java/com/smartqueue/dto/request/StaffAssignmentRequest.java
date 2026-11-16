package com.smartqueue.dto.request;

import jakarta.validation.constraints.NotNull;

public class StaffAssignmentRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Service ID is required")
    private Long serviceId;

    private String counterName;

    public StaffAssignmentRequest() {}

    public StaffAssignmentRequest(Long userId, Long serviceId, String counterName) {
        this.userId = userId;
        this.serviceId = serviceId;
        this.counterName = counterName;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getServiceId() {
        return serviceId;
    }

    public void setServiceId(Long serviceId) {
        this.serviceId = serviceId;
    }

    public String getCounterName() {
        return counterName;
    }

    public void setCounterName(String counterName) {
        this.counterName = counterName;
    }
}
