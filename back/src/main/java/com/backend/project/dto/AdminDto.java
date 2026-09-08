package com.backend.project.dto;

import lombok.*;

import java.math.BigDecimal;

public class AdminDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DashboardResponse {
        private long todayBookings;
        private long waitingCustomers;
        private long currentlyServing;
        private long completed;
        private long cancelled;
        private long noShows;
        private BigDecimal revenue;
        private long availableStaff;
        private long totalStaff;
    }
}
