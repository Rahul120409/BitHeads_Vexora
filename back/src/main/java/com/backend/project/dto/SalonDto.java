package com.backend.project.dto;

import lombok.*;

public class SalonDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SalonRequest {
        private String name;
        private String address;
        private String city;
        private String state;
        private String phone;
        private String pincode;
        private String salonType;
        private String email;
        private String operatingTimings;
        private String status;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SalonResponse {
        private Long id;
        private String name;
        private String address;
        private String city;
        private String state;
        private String phone;
        private String pincode;
        private String salonType;
        private String email;
        private String operatingTimings;
        private String status;
    }
}
