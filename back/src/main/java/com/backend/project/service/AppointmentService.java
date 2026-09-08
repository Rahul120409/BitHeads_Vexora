package com.backend.project.service;

import com.backend.project.dto.AppointmentDto;
import com.backend.project.entity.*;
import com.backend.project.enums.AppointmentStatus;
import com.backend.project.enums.PaymentStatus;
import com.backend.project.enums.QueueStatus;
import com.backend.project.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final StaffRepository staffRepository;
    private final SalonServiceRepository serviceRepository;
    private final QueueService queueService;
    private final QueueItemRepository queueItemRepository;
    private final PaymentRepository paymentRepository;

    @Transactional
    public AppointmentDto.BookResponse bookAppointment(AppointmentDto.BookRequest request) {
        User customer = null;
        if (request.getCustomerId() != null) {
            customer = userRepository.findById(request.getCustomerId()).orElse(null);
        }

        SalonService service = null;
        if (request.getServiceId() != null) {
            service = serviceRepository.findById(request.getServiceId()).orElse(null);
        }

        Staff staff = null;
        if (request.getStaffId() != null) {
            staff = staffRepository.findById(request.getStaffId()).orElse(null);
        }

        LocalDateTime apptTime = LocalDateTime.now();
        if (request.getAppointmentTime() != null && !request.getAppointmentTime().isBlank()) {
            try {
                apptTime = LocalDateTime.parse(request.getAppointmentTime());
            } catch (Exception e) {
                // Ignore parse errors and fallback to now
            }
        }

        String phone = request.getEffectivePhone();
        if (phone == null && customer != null) {
            phone = customer.getMobileNumber();
        }

        Appointment appointment = Appointment.builder()
                .customer(customer)
                .customerName(request.getCustomerName() != null && !request.getCustomerName().isBlank() ? request.getCustomerName().trim() : (customer != null ? customer.getName() : "Guest Customer"))
                .customerPhone(phone)
                .staff(staff)
                .service(service)
                .appointmentTime(apptTime)
                .status(AppointmentStatus.CONFIRMED)
                .build();

        Appointment savedAppt = appointmentRepository.save(appointment);

        // Automatically enqueue customer
        QueueItem queueItem = queueService.enqueueAppointment(savedAppt);

        // Pre-create pending mock payment record
        if (service != null) {
            paymentRepository.save(Payment.builder()
                    .appointment(savedAppt)
                    .amount(service.getPrice())
                    .status(PaymentStatus.PENDING)
                    .transactionRef("TXN-" + System.currentTimeMillis())
                    .build());
        }

        return AppointmentDto.BookResponse.builder()
                .appointmentId(savedAppt.getId())
                .tokenNumber(savedAppt.getTokenNumber() != null ? savedAppt.getTokenNumber() : String.valueOf(savedAppt.getId()))
                .queuePosition(queueItem.getPosition())
                .estimatedWaitMinutes(queueItem.getEstimatedWaitMinutes())
                .status(savedAppt.getStatus())
                .build();
    }

    @Transactional(readOnly = true)
    public List<AppointmentDto.AppointmentResponse> getAllAppointments() {
        return appointmentRepository.findAllByOrderByAppointmentTimeDesc()
                .stream().map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AppointmentDto.AppointmentResponse> getCustomerAppointments(Long customerId) {
        return appointmentRepository.findByCustomerIdOrderByAppointmentTimeDesc(customerId)
                .stream().map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AppointmentDto.AppointmentResponse> getTodayAppointments() {
        LocalDateTime start = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime end = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);
        return appointmentRepository.findTodayAppointments(start, end)
                .stream().map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AppointmentDto.AppointmentResponse cancelAppointment(Long appointmentId) {
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id " + appointmentId));

        appt.setStatus(AppointmentStatus.CANCELLED);
        Appointment saved = appointmentRepository.save(appt);

        // Remove from queue if present
        Optional<QueueItem> queueItemOpt = queueItemRepository.findByAppointmentId(appointmentId);
        if (queueItemOpt.isPresent()) {
            QueueItem q = queueItemOpt.get();
            if (q.getStatus() == QueueStatus.WAITING || q.getStatus() == QueueStatus.SERVING) {
                q.setStatus(QueueStatus.CANCELLED);
                queueItemRepository.save(q);
                queueService.recalculateQueue();
            }
        }

        return mapToResponse(saved);
    }

    public AppointmentDto.AppointmentResponse mapToResponse(Appointment appt) {
        String phone = appt.getCustomerPhone() != null ? appt.getCustomerPhone() : (appt.getCustomer() != null ? appt.getCustomer().getMobileNumber() : null);

        String token = appt.getTokenNumber();
        if (token == null || token.isBlank()) {
            token = String.valueOf(appt.getId());
        } else {
            String clean = token.replaceAll("[^0-9]", "");
            if (!clean.isBlank()) {
                token = clean;
            }
        }

        return AppointmentDto.AppointmentResponse.builder()
                .id(appt.getId())
                .tokenNumber(token)
                .customerId(appt.getCustomer() != null ? appt.getCustomer().getId() : null)
                .customerName(appt.getCustomer() != null ? appt.getCustomer().getName() : appt.getCustomerName())
                .customerPhone(phone)
                .staffId(appt.getStaff() != null ? appt.getStaff().getId() : null)
                .staffName(appt.getStaff() != null ? appt.getStaff().getName() : "Unassigned")
                .serviceId(appt.getService() != null ? appt.getService().getId() : null)
                .serviceName(appt.getService() != null ? appt.getService().getName() : "General")
                .durationMinutes(appt.getService() != null ? appt.getService().getDurationMinutes() : 30)
                .price(appt.getService() != null ? appt.getService().getPrice().doubleValue() : 0.0)
                .appointmentTime(appt.getAppointmentTime())
                .status(appt.getStatus())
                .createdAt(appt.getCreatedAt())
                .build();
    }
}
