package com.backend.project.dto;

import com.backend.project.enums.AppointmentStatus;
import lombok.*;

import java.time.LocalDateTime;

public class AppointmentDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BookRequest {
        private Long customerId;
        private Long serviceId;
        private Long staffId;
        private String customerName; // Optional fallback / walk-in name
        private String customerPhone; // Walk-in / offline phone number
        private String phoneNumber;
        private String phone;
        private String appointmentTime; // Optional: formatted time string or iso

        public String getEffectivePhone() {
            if (phoneNumber != null && !phoneNumber.isBlank()) return phoneNumber.trim();
            if (customerPhone != null && !customerPhone.isBlank()) return customerPhone.trim();
            if (phone != null && !phone.isBlank()) return phone.trim();
            return null;
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BookResponse {
        private Long appointmentId;
        private String tokenNumber;
        private Integer queuePosition;
        private Integer estimatedWaitMinutes;
        private AppointmentStatus status;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AppointmentResponse {
        private Long id;
        private String tokenNumber;
        private Long customerId;
        private String customerName;
        private String customerPhone;
        private Long staffId;
        private String staffName;
        private Long serviceId;
        private String serviceName;
        private Integer durationMinutes;
        private Double price;
        private LocalDateTime appointmentTime;
        private AppointmentStatus status;
        private LocalDateTime createdAt;
    }
}
