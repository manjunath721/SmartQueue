package com.smartqueue.repository;

import com.smartqueue.entity.StaffServiceAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StaffServiceAssignmentRepository extends JpaRepository<StaffServiceAssignment, Long> {
    List<StaffServiceAssignment> findByUserId(Long userId);
    List<StaffServiceAssignment> findByServiceId(Long serviceId);
    Optional<StaffServiceAssignment> findByUserIdAndServiceId(Long userId, Long serviceId);
    void deleteByUserId(Long userId);
    void deleteByUserIdAndServiceId(Long userId, Long serviceId);
}
