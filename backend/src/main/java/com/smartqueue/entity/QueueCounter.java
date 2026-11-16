package com.smartqueue.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(
    name = "queue_counters",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"service_id", "counter_date"})
    }
)
public class QueueCounter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "service_id", nullable = false)
    private ServiceEntity service;

    @Column(name = "counter_date", nullable = false)
    private LocalDate counterDate;

    @Column(name = "last_token_number", nullable = false)
    private Integer lastTokenNumber = 0;

    public QueueCounter() {}

    public QueueCounter(ServiceEntity service, LocalDate counterDate, Integer lastTokenNumber) {
        this.service = service;
        this.counterDate = counterDate;
        this.lastTokenNumber = lastTokenNumber != null ? lastTokenNumber : 0;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ServiceEntity getService() {
        return service;
    }

    public void setService(ServiceEntity service) {
        this.service = service;
    }

    public LocalDate getCounterDate() {
        return counterDate;
    }

    public void setCounterDate(LocalDate counterDate) {
        this.counterDate = counterDate;
    }

    public Integer getLastTokenNumber() {
        return lastTokenNumber;
    }

    public void setLastTokenNumber(Integer lastTokenNumber) {
        this.lastTokenNumber = lastTokenNumber;
    }
}
