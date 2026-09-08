package com.backend.project.service;

import com.backend.project.dto.QueueDto;
import com.backend.project.entity.Appointment;
import com.backend.project.entity.QueueItem;
import com.backend.project.entity.SalonService;
import com.backend.project.entity.Staff;
import com.backend.project.enums.AppointmentStatus;
import com.backend.project.enums.QueueStatus;
import com.backend.project.enums.StaffStatus;
import com.backend.project.repository.AppointmentRepository;
import com.backend.project.repository.QueueItemRepository;
import com.backend.project.repository.SalonServiceRepository;
import com.backend.project.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class QueueService {

    private final QueueItemRepository queueItemRepository;
    private final AppointmentRepository appointmentRepository;
    private final SalonServiceRepository serviceRepository;
    private final StaffRepository staffRepository;

    public synchronized int getNextSequenceNumber() {
        int maxToken = 0;

        // 1. Scan active queue items (SERVING & WAITING)
        List<QueueItem> activeItems = queueItemRepository.findByStatusInOrderByPositionAsc(
                List.of(QueueStatus.SERVING, QueueStatus.WAITING)
        );
        for (QueueItem q : activeItems) {
            if (q.getAppointment() != null) {
                int t = parseToken(q.getAppointment().getTokenNumber(), q.getAppointment().getId());
                if (t > maxToken) maxToken = t;
            }
        }

        // 2. Scan all appointments in database
        List<Appointment> allAppts = appointmentRepository.findAll();
        for (Appointment a : allAppts) {
            int t = parseToken(a.getTokenNumber(), a.getId());
            if (t > maxToken) maxToken = t;
        }

        return maxToken + 1;
    }

    private int parseToken(String tokenStr, Long fallbackId) {
        if (tokenStr != null && !tokenStr.isBlank()) {
            String clean = tokenStr.replaceAll("[^0-9]", "");
            if (!clean.isBlank()) {
                try {
                    return Integer.parseInt(clean);
                } catch (NumberFormatException ignored) {}
            }
        }
        return fallbackId != null ? fallbackId.intValue() : 0;
    }

    @Transactional
    public synchronized QueueItem enqueueAppointment(Appointment appointment) {
        if (appointment.getTokenNumber() == null || appointment.getTokenNumber().isBlank()) {
            int nextSeq = getNextSequenceNumber();
            appointment.setTokenNumber(String.valueOf(nextSeq));
            appointmentRepository.save(appointment);
        }

        // Find current waiting list to determine position and wait time
        List<QueueItem> waitingItems = queueItemRepository.findByStatusOrderByPositionAsc(QueueStatus.WAITING);

        int nextPosition = waitingItems.size() + 1;

        // Calculate initial wait time: sum of durations of waiting customers
        int accumulatedWait = waitingItems.stream()
                .mapToInt(item -> item.getAppointment().getService() != null ? item.getAppointment().getService().getDurationMinutes() : 20)
                .sum();

        // If someone is currently serving, add estimated residual time (e.g., 10 mins)
        long servingCount = queueItemRepository.countByStatus(QueueStatus.SERVING);
        if (servingCount > 0) {
            accumulatedWait += 15;
        }

        QueueItem queueItem = QueueItem.builder()
                .appointment(appointment)
                .position(nextPosition)
                .estimatedWaitMinutes(accumulatedWait)
                .status(QueueStatus.WAITING)
                .joinedAt(LocalDateTime.now())
                .build();

        QueueItem saved = queueItemRepository.save(queueItem);
        recalculateQueue();
        return saved;
    }

    @Transactional
    public void recalculateQueue() {
        // Enforce strict sequence order on all active queue items
        List<QueueItem> servingList = queueItemRepository.findByStatusOrderByPositionAsc(QueueStatus.SERVING);
        int lastToken = 0;
        for (QueueItem s : servingList) {
            if (s.getAppointment() != null) {
                int sToken = parseToken(s.getAppointment().getTokenNumber(), s.getAppointment().getId());
                if (sToken > lastToken) lastToken = sToken;
                s.getAppointment().setTokenNumber(String.valueOf(lastToken));
                appointmentRepository.save(s.getAppointment());
            }
        }

        List<QueueItem> waitingList = queueItemRepository.findByStatusOrderByPositionAsc(QueueStatus.WAITING);
        long servingCount = servingList.size();

        int runningWaitTime = servingCount > 0 ? 10 : 0;
        int position = 1;

        for (QueueItem item : waitingList) {
            item.setPosition(position++);
            item.setEstimatedWaitMinutes(runningWaitTime);
            int serviceDuration = item.getAppointment().getService() != null
                    ? item.getAppointment().getService().getDurationMinutes()
                    : 20;
            runningWaitTime += serviceDuration;

            if (item.getAppointment() != null) {
                int itemToken = parseToken(item.getAppointment().getTokenNumber(), item.getAppointment().getId());
                if (itemToken <= lastToken) {
                    itemToken = lastToken + 1;
                    item.getAppointment().setTokenNumber(String.valueOf(itemToken));
                    appointmentRepository.save(item.getAppointment());
                }
                lastToken = itemToken;
            }
        }

        queueItemRepository.saveAll(waitingList);
    }

    @Transactional(readOnly = true)
    public List<QueueDto.QueueResponse> getLiveQueue() {
        List<QueueItem> activeItems = queueItemRepository.findByStatusInOrderByPositionAsc(
                List.of(QueueStatus.SERVING, QueueStatus.WAITING)
        );

        return activeItems.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public QueueDto.QueueResponse getCustomerQueueStatus(Long customerId) {
        List<QueueItem> activeItems = queueItemRepository.findByCustomerIdAndStatusIn(
                customerId, List.of(QueueStatus.SERVING, QueueStatus.WAITING)
        );

        if (activeItems.isEmpty()) {
            return null;
        }

        return mapToResponse(activeItems.get(0));
    }

    @Transactional
    public QueueDto.QueueResponse startService(Long queueId) {
        QueueItem item = queueItemRepository.findById(queueId)
                .orElseThrow(() -> new RuntimeException("Queue item not found with id " + queueId));

        // Mark any previous SERVING items as COMPLETED
        List<QueueItem> currentlyServing = queueItemRepository.findByStatusOrderByPositionAsc(QueueStatus.SERVING);
        for (QueueItem prev : currentlyServing) {
            if (!prev.getId().equals(queueId)) {
                prev.setStatus(QueueStatus.COMPLETED);
                if (prev.getAppointment() != null) {
                    prev.getAppointment().setStatus(AppointmentStatus.COMPLETED);
                    appointmentRepository.save(prev.getAppointment());
                }
                queueItemRepository.save(prev);
            }
        }

        item.setStatus(QueueStatus.SERVING);
        item.setEstimatedWaitMinutes(0);
        item.getAppointment().setStatus(AppointmentStatus.CONFIRMED);

        if (item.getAppointment().getStaff() != null) {
            Staff staff = item.getAppointment().getStaff();
            staff.setStatus(StaffStatus.BUSY);
            staffRepository.save(staff);
        }

        QueueItem saved = queueItemRepository.save(item);
        recalculateQueue();
        return mapToResponse(saved);
    }

    @Transactional
    public QueueDto.QueueResponse completeService(Long queueId) {
        QueueItem item = queueItemRepository.findById(queueId)
                .orElseThrow(() -> new RuntimeException("Queue item not found with id " + queueId));

        item.setStatus(QueueStatus.COMPLETED);
        item.getAppointment().setStatus(AppointmentStatus.COMPLETED);
        appointmentRepository.save(item.getAppointment());

        if (item.getAppointment().getStaff() != null) {
            Staff staff = item.getAppointment().getStaff();
            staff.setStatus(StaffStatus.AVAILABLE);
            staffRepository.save(staff);
        }

        QueueItem saved = queueItemRepository.save(item);
        recalculateQueue();
        return mapToResponse(saved);
    }

    @Transactional
    public QueueDto.QueueResponse noShowService(Long queueId) {
        QueueItem item = queueItemRepository.findById(queueId)
                .orElseThrow(() -> new RuntimeException("Queue item not found with id " + queueId));

        item.setStatus(QueueStatus.COMPLETED);
        item.getAppointment().setStatus(AppointmentStatus.NO_SHOW);
        appointmentRepository.save(item.getAppointment());

        if (item.getAppointment().getStaff() != null) {
            Staff staff = item.getAppointment().getStaff();
            staff.setStatus(StaffStatus.AVAILABLE);
            staffRepository.save(staff);
        }

        QueueItem saved = queueItemRepository.save(item);
        recalculateQueue();
        return mapToResponse(saved);
    }

    @Transactional
    public QueueDto.QueueResponse cancelQueueItem(Long queueId) {
        QueueItem item = queueItemRepository.findById(queueId)
                .orElseThrow(() -> new RuntimeException("Queue item not found with id " + queueId));

        item.setStatus(QueueStatus.CANCELLED);
        item.getAppointment().setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(item.getAppointment());

        if (item.getAppointment().getStaff() != null) {
            Staff staff = item.getAppointment().getStaff();
            staff.setStatus(StaffStatus.AVAILABLE);
            staffRepository.save(staff);
        }

        QueueItem saved = queueItemRepository.save(item);
        recalculateQueue();
        return mapToResponse(saved);
    }

    @Transactional
    public QueueDto.QueueResponse addWalkIn(QueueDto.WalkInRequest request) {
        Long effectiveServiceId = request.getEffectiveServiceId();
        SalonService service = null;
        if (effectiveServiceId != null) {
            service = serviceRepository.findById(effectiveServiceId).orElse(null);
        }

        Long effectiveStaffId = request.getEffectiveStaffId();
        Staff staff = null;
        if (effectiveStaffId != null) {
            staff = staffRepository.findById(effectiveStaffId).orElse(null);
        }

        Appointment walkInAppt = Appointment.builder()
                .customer(null)
                .customerName(request.getCustomerName() != null && !request.getCustomerName().isBlank() ? request.getCustomerName().trim() : "Walk-in Guest")
                .customerPhone(request.getEffectivePhone())
                .service(service)
                .staff(staff)
                .appointmentTime(LocalDateTime.now())
                .status(AppointmentStatus.CONFIRMED)
                .build();

        Appointment savedAppt = appointmentRepository.save(walkInAppt);
        QueueItem queued = enqueueAppointment(savedAppt);
        return mapToResponse(queued);
    }

    @Transactional
    public QueueDto.QueueSummaryResponse getQueueSummary() {
        recalculateQueue();

        List<QueueItem> servingItems = queueItemRepository.findByStatusOrderByPositionAsc(QueueStatus.SERVING);
        List<QueueItem> waitingItems = queueItemRepository.findByStatusOrderByPositionAsc(QueueStatus.WAITING);

        List<QueueDto.QueueResponse> servingResponses = servingItems.stream().map(this::mapToResponse).collect(Collectors.toList());
        List<QueueDto.QueueResponse> waitingResponses = waitingItems.stream().map(this::mapToResponse).collect(Collectors.toList());

        String ongoingToken = "None";
        String ongoingCustomer = "None";
        String ongoingStylist = "None";

        if (!servingResponses.isEmpty()) {
            QueueDto.QueueResponse firstServing = servingResponses.get(0);
            ongoingToken = firstServing.getTokenNumber();
            ongoingCustomer = firstServing.getCustomerName();
            ongoingStylist = firstServing.getStaffName();
        } else if (!waitingResponses.isEmpty()) {
            ongoingToken = waitingResponses.get(0).getTokenNumber();
            ongoingCustomer = waitingResponses.get(0).getCustomerName();
            ongoingStylist = waitingResponses.get(0).getStaffName();
        }

        int estWait = waitingResponses.stream().mapToInt(q -> q.getEstimatedWaitMinutes() != null ? q.getEstimatedWaitMinutes() : 0).max().orElse(0);

        int nextAvailableNum = getNextSequenceNumber();
        String nextAvailableToken = String.valueOf(nextAvailableNum);
        int nextQueuePosition = waitingResponses.size() + 1;

        int waitForNext = waitingResponses.stream()
                .mapToInt(item -> item.getDurationMinutes() != null ? item.getDurationMinutes() : 25)
                .sum();
        if (!servingResponses.isEmpty()) {
            waitForNext += 10;
        }

        return QueueDto.QueueSummaryResponse.builder()
                .ongoingToken(ongoingToken)
                .ongoingCustomerName(ongoingCustomer)
                .ongoingStylistName(ongoingStylist)
                .totalServing(servingResponses.size())
                .totalWaiting(waitingResponses.size())
                .estimatedWaitMinutes(estWait)
                .nextAvailableToken(nextAvailableToken)
                .nextQueuePosition(nextQueuePosition)
                .estimatedWaitMinutesForNext(waitForNext)
                .currentlyServing(servingResponses)
                .waitingQueue(waitingResponses)
                .build();
    }

    public QueueDto.QueueResponse mapToResponse(QueueItem item) {
        Appointment appt = item.getAppointment();
        String customerName = appt.getCustomer() != null ? appt.getCustomer().getName() : appt.getCustomerName();
        String customerPhone = appt.getCustomerPhone() != null ? appt.getCustomerPhone() : (appt.getCustomer() != null ? appt.getCustomer().getMobileNumber() : null);
        String serviceName = appt.getService() != null ? appt.getService().getName() : "General Styling";
        Integer duration = appt.getService() != null ? appt.getService().getDurationMinutes() : 30;
        String staffName = appt.getStaff() != null ? appt.getStaff().getName() : "Any Available Stylist";

        String token = appt.getTokenNumber();
        if (token == null || token.isBlank()) {
            token = String.valueOf(appt.getId());
        } else {
            String clean = token.replaceAll("[^0-9]", "");
            if (!clean.isBlank()) {
                token = clean;
            }
        }

        return QueueDto.QueueResponse.builder()
                .queueId(item.getId())
                .appointmentId(appt.getId())
                .tokenNumber(token)
                .customerId(appt.getCustomer() != null ? appt.getCustomer().getId() : null)
                .customerName(customerName)
                .customerPhone(customerPhone)
                .serviceId(appt.getService() != null ? appt.getService().getId() : null)
                .service(serviceName)
                .durationMinutes(duration)
                .staffId(appt.getStaff() != null ? appt.getStaff().getId() : null)
                .staffName(staffName)
                .position(item.getPosition())
                .estimatedWaitMinutes(item.getEstimatedWaitMinutes())
                .status(item.getStatus())
                .joinedAt(item.getJoinedAt())
                .build();
    }
}
