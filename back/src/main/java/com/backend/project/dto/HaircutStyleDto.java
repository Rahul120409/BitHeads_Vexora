package com.backend.project.dto;

import lombok.*;

import java.math.BigDecimal;

public class HaircutStyleDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Request {
        private Long salonId;
        private String name;
        private String gender;
        private BigDecimal price;
        private Integer duration;
        private Integer durationMinutes;
        private String description;
        private String imageUrl;
        private String picture;

        public Integer getEffectiveDuration() {
            if (durationMinutes != null) return durationMinutes;
            if (duration != null) return duration;
            return 30; // default 30 mins
        }

        public String getEffectiveImageUrl() {
            if (imageUrl != null && !imageUrl.isBlank()) return imageUrl;
            if (picture != null && !picture.isBlank()) return picture;
            return null;
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
        private String name;
        private String gender;
        private BigDecimal price;
        private Integer durationMinutes;
        private String description;
        private String imageUrl;
    }
}
