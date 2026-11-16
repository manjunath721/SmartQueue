package com.smartqueue.dto.response;

import java.util.List;

public class QueueDisplayResponse {

    private Long serviceId;
    private String serviceName;
    private String servicePrefix;
    private String currentlyServingToken;
    private String counterName;
    private List<String> nextWaitingTokens;
    private long waitingCount;

    public QueueDisplayResponse() {}

    public Long getServiceId() {
        return serviceId;
    }

    public void setServiceId(Long serviceId) {
        this.serviceId = serviceId;
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public String getServicePrefix() {
        return servicePrefix;
    }

    public void setServicePrefix(String servicePrefix) {
        this.servicePrefix = servicePrefix;
    }

    public String getCurrentlyServingToken() {
        return currentlyServingToken;
    }

    public void setCurrentlyServingToken(String currentlyServingToken) {
        this.currentlyServingToken = currentlyServingToken;
    }

    public String getCounterName() {
        return counterName;
    }

    public void setCounterName(String counterName) {
        this.counterName = counterName;
    }

    public List<String> getNextWaitingTokens() {
        return nextWaitingTokens;
    }

    public void setNextWaitingTokens(List<String> nextWaitingTokens) {
        this.nextWaitingTokens = nextWaitingTokens;
    }

    public long getWaitingCount() {
        return waitingCount;
    }

    public void setWaitingCount(long waitingCount) {
        this.waitingCount = waitingCount;
    }
}
