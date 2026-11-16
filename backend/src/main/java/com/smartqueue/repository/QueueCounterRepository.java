package com.smartqueue.repository;

import com.smartqueue.entity.QueueCounter;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface QueueCounterRepository extends JpaRepository<QueueCounter, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT qc FROM QueueCounter qc WHERE qc.service.id = :serviceId AND qc.counterDate = :counterDate")
    Optional<QueueCounter> findByServiceIdAndCounterDateForUpdate(
        @Param("serviceId") Long serviceId,
        @Param("counterDate") LocalDate counterDate
    );

    Optional<QueueCounter> findByServiceIdAndCounterDate(Long serviceId, LocalDate counterDate);
}
