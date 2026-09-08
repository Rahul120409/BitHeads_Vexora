package com.backend.project.dto;

import lombok.*;

public class LocationDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StateRequest {
        private String stateCode;
        private String stateName;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StateResponse {
        private Long id;
        private String stateCode;
        private String stateName;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CityRequest {
        private String cityCode;
        private String cityName;
        private Long stateId;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CityResponse {
        private Long id;
        private String cityCode;
        private String cityName;
        private Long stateId;
        private String stateCode;
        private String stateName;
    }
}
