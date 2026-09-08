package com.backend.project.repository;

import com.backend.project.entity.SalonService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SalonServiceRepository extends JpaRepository<SalonService, Long> {
    List<SalonService> findBySalonId(Long salonId);
}
