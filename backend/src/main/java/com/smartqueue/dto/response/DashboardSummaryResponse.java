package com.smartqueue.dto.response;

import java.util.List;
import java.util.Map;

public class DashboardSummaryResponse {

    private long totalCustomers;
    private long totalTokensGenerated;
    private long currentlyWaiting;
    private long currentlyServing;
    private long completedToday;
    private long cancelledToday;
    private double avgWaitTimeMinutes;
    private List<ServiceResponse> serviceSummaries;
    private Map<String, Long> tokensByStatus;
    private Map<String, Long> tokensByService;
    private List<TokenResponse> recentTokens;

    public DashboardSummaryResponse() {}

    public long getTotalCustomers() {
        return totalCustomers;
    }

    public void setTotalCustomers(long totalCustomers) {
        this.totalCustomers = totalCustomers;
    }

    public long getTotalTokensGenerated() {
        return totalTokensGenerated;
    }

    public void setTotalTokensGenerated(long totalTokensGenerated) {
        this.totalTokensGenerated = totalTokensGenerated;
    }

    public long getCurrentlyWaiting() {
        return currentlyWaiting;
    }

    public void setCurrentlyWaiting(long currentlyWaiting) {
        this.currentlyWaiting = currentlyWaiting;
    }

    public long getCurrentlyServing() {
        return currentlyServing;
    }

    public void setCurrentlyServing(long currentlyServing) {
        this.currentlyServing = currentlyServing;
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

    public double getAvgWaitTimeMinutes() {
        return avgWaitTimeMinutes;
    }

    public void setAvgWaitTimeMinutes(double avgWaitTimeMinutes) {
        this.avgWaitTimeMinutes = avgWaitTimeMinutes;
    }

    public List<ServiceResponse> getServiceSummaries() {
        return serviceSummaries;
    }

    public void setServiceSummaries(List<ServiceResponse> serviceSummaries) {
        this.serviceSummaries = serviceSummaries;
    }

    public Map<String, Long> getTokensByStatus() {
        return tokensByStatus;
    }

    public void setTokensByStatus(Map<String, Long> tokensByStatus) {
        this.tokensByStatus = tokensByStatus;
    }

    public Map<String, Long> getTokensByService() {
        return tokensByService;
    }

    public void setTokensByService(Map<String, Long> tokensByService) {
        this.tokensByService = tokensByService;
    }

    public List<TokenResponse> getRecentTokens() {
        return recentTokens;
    }

    public void setRecentTokens(List<TokenResponse> recentTokens) {
        this.recentTokens = recentTokens;
    }
}
