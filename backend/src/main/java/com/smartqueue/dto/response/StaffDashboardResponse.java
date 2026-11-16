package com.smartqueue.dto.response;

import java.util.List;

public class StaffDashboardResponse {

    private Long staffId;
    private String staffName;
    private List<ServiceResponse> assignedServices;
    private TokenResponse currentlyServingToken;
    private List<TokenResponse> waitingTokens;
    private long totalWaiting;
    private long completedToday;
    private long cancelledToday;

    public StaffDashboardResponse() {}

    public Long getStaffId() {
        return staffId;
    }

    public void setStaffId(Long staffId) {
        this.staffId = staffId;
    }

    public String getStaffName() {
        return staffName;
    }

    public void setStaffName(String staffName) {
        this.staffName = staffName;
    }

    public List<ServiceResponse> getAssignedServices() {
        return assignedServices;
    }

    public void setAssignedServices(List<ServiceResponse> assignedServices) {
        this.assignedServices = assignedServices;
    }

    public TokenResponse getCurrentlyServingToken() {
        return currentlyServingToken;
    }

    public void setCurrentlyServingToken(TokenResponse currentlyServingToken) {
        this.currentlyServingToken = currentlyServingToken;
    }

    public List<TokenResponse> getWaitingTokens() {
        return waitingTokens;
    }

    public void setWaitingTokens(List<TokenResponse> waitingTokens) {
        this.waitingTokens = waitingTokens;
    }

    public long getTotalWaiting() {
        return totalWaiting;
    }

    public void setTotalWaiting(long totalWaiting) {
        this.totalWaiting = totalWaiting;
    }

    public long getCompletedToday() {
        return completedToday;
    }

    public void setCompletedToday(long completedToday) {
        this.completedToday = completedToday;
    }

    public long getCancelledToday() {
        return cancelledToday;
    }

    public void setCancelledToday(long cancelledToday) {
        this.cancelledToday = cancelledToday;
    }
}
