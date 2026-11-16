package com.smartqueue.dto.request;

import jakarta.validation.constraints.NotNull;

public class CallNextRequest {

    @NotNull(message = "Service ID is required")
    private Long serviceId;

    private String counterName;

    public CallNextRequest() {}

    public CallNextRequest(Long serviceId, String counterName) {
        this.serviceId = serviceId;
        this.counterName = counterName;
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
