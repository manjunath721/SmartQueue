package com.smartqueue.repository;

import com.smartqueue.entity.QueueToken;
import com.smartqueue.enums.TokenStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface QueueTokenRepository extends JpaRepository<QueueToken, Long> {

    Optional<QueueToken> findByTrackingId(String trackingId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT qt FROM QueueToken qt WHERE qt.service.id = :serviceId AND qt.status = com.smartqueue.enums.TokenStatus.WAITING ORDER BY qt.sequenceNumber ASC, qt.createdAt ASC")
    List<QueueToken> findNextWaitingTokensForUpdate(@Param("serviceId") Long serviceId, Pageable pageable);

    @Query("SELECT COUNT(qt) FROM QueueToken qt WHERE qt.service.id = :serviceId AND qt.status = com.smartqueue.enums.TokenStatus.WAITING AND qt.sequenceNumber < :sequenceNumber")
    long countWaitingAhead(@Param("serviceId") Long serviceId, @Param("sequenceNumber") Integer sequenceNumber);

    Optional<QueueToken> findFirstByServiceIdAndStatusOrderByCalledAtDesc(Long serviceId, TokenStatus status);

    Optional<QueueToken> findFirstByServedByIdAndStatus(Long userId, TokenStatus status);

    List<QueueToken> findByServiceIdAndStatusOrderBySequenceNumberAsc(Long serviceId, TokenStatus status);

    Page<QueueToken> findByServiceId(Long serviceId, Pageable pageable);

    Page<QueueToken> findByServiceIdAndStatus(Long serviceId, TokenStatus status, Pageable pageable);

    @Query("SELECT qt FROM QueueToken qt WHERE " +
           "(:serviceId IS NULL OR qt.service.id = :serviceId) AND " +
           "(:status IS NULL OR qt.status = :status) AND " +
           "(:keyword IS NULL OR LOWER(qt.tokenNumber) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(qt.customer.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "qt.customer.phone LIKE CONCAT('%', :keyword, '%'))")
    Page<QueueToken> filterTokens(
        @Param("serviceId") Long serviceId,
        @Param("status") TokenStatus status,
        @Param("keyword") String keyword,
        Pageable pageable
    );

    long countByStatus(TokenStatus status);

    long countByServiceIdAndStatus(Long serviceId, TokenStatus status);

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    long countByStatusAndCompletedAtBetween(TokenStatus status, LocalDateTime start, LocalDateTime end);

    long countByStatusAndCancelledAtBetween(TokenStatus status, LocalDateTime start, LocalDateTime end);

    @Query("SELECT qt.service.name, COUNT(qt) FROM QueueToken qt GROUP BY qt.service.name")
    List<Object[]> countTokensGroupedByService();

    @Query("SELECT qt.status, COUNT(qt) FROM QueueToken qt GROUP BY qt.status")
    List<Object[]> countTokensGroupedByStatus();

    List<QueueToken> findTop10ByOrderByCreatedAtDesc();

    List<QueueToken> findTop5ByServiceIdAndStatusOrderBySequenceNumberAsc(Long serviceId, TokenStatus status);
}
