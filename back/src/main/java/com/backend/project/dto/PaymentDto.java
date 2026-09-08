package com.backend.project.dto;

import com.backend.project.enums.PaymentStatus;
import com.backend.project.enums.RefundStatus;
import lombok.*;

import java.math.BigDecimal;

public class PaymentDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentRequest {
        private Long appointmentId;
        private BigDecimal amount;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PaymentResponse {
        private Long paymentId;
        private Long appointmentId;
        private BigDecimal amount;
        private PaymentStatus status;
        private String transactionRef;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RefundRequest {
        private Long paymentId;
        private BigDecimal amount;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RefundResponse {
        private Long refundId;
        private Long paymentId;
        private BigDecimal amount;
        private RefundStatus status;
    }
}
