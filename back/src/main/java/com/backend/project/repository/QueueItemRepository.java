package com.backend.project.repository;

import com.backend.project.entity.QueueItem;
import com.backend.project.enums.QueueStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QueueItemRepository extends JpaRepository<QueueItem, Long> {

    List<QueueItem> findByStatusOrderByPositionAsc(QueueStatus status);

    List<QueueItem> findByStatusInOrderByPositionAsc(List<QueueStatus> statuses);

    Optional<QueueItem> findByAppointmentId(Long appointmentId);

    @Query("SELECT q FROM QueueItem q WHERE q.appointment.customer.id = :customerId AND q.status IN :statuses ORDER BY q.joinedAt DESC")
    List<QueueItem> findByCustomerIdAndStatusIn(Long customerId, List<QueueStatus> statuses);

    Optional<QueueItem> findTopByStatusOrderByPositionDesc(QueueStatus status);

    long countByStatus(QueueStatus status);
}
