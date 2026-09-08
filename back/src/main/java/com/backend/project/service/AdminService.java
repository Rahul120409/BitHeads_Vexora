package com.backend.project.service;

import com.backend.project.dto.AdminDto;
import com.backend.project.dto.AppointmentDto;
import com.backend.project.entity.Staff;
import com.backend.project.enums.AppointmentStatus;
import com.backend.project.enums.QueueStatus;
import com.backend.project.enums.StaffStatus;
import com.backend.project.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final AppointmentRepository appointmentRepository;
    private final QueueItemRepository queueItemRepository;
    private final StaffRepository staffRepository;
    private final PaymentRepository paymentRepository;
    private final AppointmentService appointmentService;

    @Transactional(readOnly = true)
    public AdminDto.DashboardResponse getDashboardMetrics() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);

        List<?> todayAppts = appointmentRepository.findTodayAppointments(startOfDay, endOfDay);
        long todayBookings = todayAppts.size();

        long waiting = queueItemRepository.countByStatus(QueueStatus.WAITING);
        long serving = queueItemRepository.countByStatus(QueueStatus.SERVING);
        long completed = appointmentRepository.countByStatus(AppointmentStatus.COMPLETED);
        long cancelled = appointmentRepository.countByStatus(AppointmentStatus.CANCELLED);
        long noShows = appointmentRepository.countByStatus(AppointmentStatus.NO_SHOW);

        BigDecimal revenue = paymentRepository.sumTotalRevenue();
        if (revenue == null) {
            revenue = BigDecimal.ZERO;
        }

        long availableStaff = staffRepository.countByStatus(StaffStatus.AVAILABLE);
        long totalStaff = staffRepository.count();

        return AdminDto.DashboardResponse.builder()
                .todayBookings(todayBookings)
                .waitingCustomers(waiting)
                .currentlyServing(serving)
                .completed(completed)
                .cancelled(cancelled)
                .noShows(noShows)
                .revenue(revenue)
                .availableStaff(availableStaff)
                .totalStaff(totalStaff)
                .build();
    }

    @Transactional(readOnly = true)
    public List<AppointmentDto.AppointmentResponse> getAllAppointments() {
        return appointmentRepository.findAll().stream()
                .map(appointmentService::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Staff> getAllStaff() {
        return staffRepository.findAll();
    }
}
