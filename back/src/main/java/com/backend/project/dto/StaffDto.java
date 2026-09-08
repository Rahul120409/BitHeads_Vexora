package com.backend.project.dto;

import com.backend.project.enums.StaffStatus;
import lombok.*;

public class StaffDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Request {
        private Long salonId;
        private String stylistName;
        private String name;
        private String mobileNumber;
        private String phone;
        private String specialization;
        private String specialist;
        private String email;
        private String dutyStatus;
        private StaffStatus status;

        public String getEffectiveName() {
            if (stylistName != null && !stylistName.isBlank()) return stylistName.trim();
            if (name != null && !name.isBlank()) return name.trim();
            return "Stylist";
        }

        public String getEffectiveMobile() {
            if (mobileNumber != null && !mobileNumber.isBlank()) return mobileNumber.trim();
            if (phone != null && !phone.isBlank()) return phone.trim();
            return null;
        }

        public String getEffectiveSpecialization() {
            if (specialization != null && !specialization.isBlank()) return specialization.trim();
            if (specialist != null && !specialist.isBlank()) return specialist.trim();
            return "General Stylist";
        }

        public StaffStatus getEffectiveStatus() {
            if (status != null) return status;
            if (dutyStatus != null && !dutyStatus.isBlank()) {
                try {
                    return StaffStatus.valueOf(dutyStatus.trim().toUpperCase());
                } catch (Exception e) {
                    return StaffStatus.AVAILABLE;
                }
            }
            return StaffStatus.AVAILABLE;
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private Long salonId;
        private String salonName;
        private String stylistName;
        private String name; // Alias for stylistName
        private String mobileNumber;
        private String phone; // Alias for mobileNumber
        private String specialization;
        private String email;
        private String dutyStatus;
        private String status; // Alias for dutyStatus
    }
}
