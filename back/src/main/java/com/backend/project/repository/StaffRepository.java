package com.backend.project.repository;

import com.backend.project.entity.Staff;
import com.backend.project.enums.StaffStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Long> {
    List<Staff> findBySalonId(Long salonId);
    Optional<Staff> findByUserId(Long userId);
    long countByStatus(StaffStatus status);
}
