package com.backend.project.dto;

import com.backend.project.enums.QueueStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

public class QueueDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class WalkInRequest {
        private String customerName;
        private String phoneNumber;
        private String customerPhone;
        private String phone;
        private Long serviceId;
        private Long selectService;
        private Long staffId;
        private Long assignStylist;
        private Long stylistId;

        public String getEffectivePhone() {
            if (phoneNumber != null && !phoneNumber.isBlank()) return phoneNumber.trim();
            if (customerPhone != null && !customerPhone.isBlank()) return customerPhone.trim();
            if (phone != null && !phone.isBlank()) return phone.trim();
            return null;
        }

        public Long getEffectiveServiceId() {
            if (serviceId != null) return serviceId;
            if (selectService != null) return selectService;
            return null;
        }

        public Long getEffectiveStaffId() {
            if (staffId != null) return staffId;
            if (assignStylist != null) return assignStylist;
            if (stylistId != null) return stylistId;
            return null;
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QueueResponse {
        private Long queueId;
        private Long appointmentId;
        private String tokenNumber;
        private Long customerId;
        private String customerName;
        private String customerPhone;
        private Long serviceId;
        private String service;
        private Integer durationMinutes;
        private Long staffId;
        private String staffName;
        private Integer position;
        private Integer estimatedWaitMinutes;
        private QueueStatus status;
        private LocalDateTime joinedAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QueueSummaryResponse {
        private String ongoingToken; // e.g. "T-001"
        private String ongoingCustomerName;
        private String ongoingStylistName;
        private Integer totalServing;
        private Integer totalWaiting;
        private Integer estimatedWaitMinutes;
        private String nextAvailableToken; // Next token number available for customer to book (e.g. "T-004")
        private Integer nextQueuePosition;  // The queue position customer will get (e.g. 3)
        private Integer estimatedWaitMinutesForNext; // Estimated wait time if customer books now
        private List<QueueResponse> currentlyServing;
        private List<QueueResponse> waitingQueue;
    }
}
