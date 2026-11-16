package com.smartqueue.dto.request;

public class CancelTokenRequest {

    private String reason;

    public CancelTokenRequest() {}

    public CancelTokenRequest(String reason) {
        this.reason = reason;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
