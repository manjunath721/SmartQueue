package com.smartqueue.repository;

import com.smartqueue.entity.ServiceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceRepository extends JpaRepository<ServiceEntity, Long> {
    List<ServiceEntity> findByActiveTrueOrderByNameAsc();
    Optional<ServiceEntity> findByCode(String code);
    Boolean existsByNameIgnoreCase(String name);
    Boolean existsByCodeIgnoreCase(String code);
}
