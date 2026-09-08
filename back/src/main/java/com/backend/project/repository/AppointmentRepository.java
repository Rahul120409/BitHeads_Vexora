package com.backend.project.repository;

import com.backend.project.entity.Appointment;
import com.backend.project.enums.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByCustomerIdOrderByAppointmentTimeDesc(Long customerId);
    List<Appointment> findByStaffId(Long staffId);
    List<Appointment> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime start, LocalDateTime end);
    long countByStatus(AppointmentStatus status);

    @Query("SELECT a FROM Appointment a WHERE a.appointmentTime >= :start AND a.appointmentTime <= :end ORDER BY a.appointmentTime ASC")
    List<Appointment> findTodayAppointments(LocalDateTime start, LocalDateTime end);

    List<Appointment> findAllByOrderByAppointmentTimeDesc();

    @Query("SELECT COALESCE(MAX(a.id), 0) FROM Appointment a")
    Long findMaxId();
}
