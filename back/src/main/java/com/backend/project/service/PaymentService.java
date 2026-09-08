package com.backend.project.service;

import com.backend.project.dto.PaymentDto;
import com.backend.project.entity.Appointment;
import com.backend.project.entity.Payment;
import com.backend.project.entity.Refund;
import com.backend.project.enums.PaymentStatus;
import com.backend.project.enums.RefundStatus;
import com.backend.project.repository.AppointmentRepository;
import com.backend.project.repository.PaymentRepository;
import com.backend.project.repository.RefundRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final RefundRepository refundRepository;
    private final AppointmentRepository appointmentRepository;

    @Transactional
    public PaymentDto.PaymentResponse processPayment(PaymentDto.PaymentRequest request) {
        Appointment appt = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        Optional<Payment> existingOpt = paymentRepository.findByAppointmentId(appt.getId());
        Payment payment;
        if (existingOpt.isPresent()) {
            payment = existingOpt.get();
            payment.setAmount(request.getAmount() != null ? request.getAmount() : payment.getAmount());
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setTransactionRef("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        } else {
            payment = Payment.builder()
                    .appointment(appt)
                    .amount(request.getAmount() != null ? request.getAmount() : BigDecimal.valueOf(350.00))
                    .status(PaymentStatus.SUCCESS)
                    .transactionRef("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                    .build();
        }

        Payment saved = paymentRepository.save(payment);

        return PaymentDto.PaymentResponse.builder()
                .paymentId(saved.getId())
                .appointmentId(appt.getId())
                .amount(saved.getAmount())
                .status(saved.getStatus())
                .transactionRef(saved.getTransactionRef())
                .build();
    }

    @Transactional
    public PaymentDto.RefundResponse processRefund(PaymentDto.RefundRequest request) {
        Payment payment = paymentRepository.findById(request.getPaymentId())
                .orElseThrow(() -> new RuntimeException("Payment record not found"));

        Refund refund = Refund.builder()
                .payment(payment)
                .amount(request.getAmount() != null ? request.getAmount() : payment.getAmount())
                .status(RefundStatus.REFUNDED)
                .build();

        Refund saved = refundRepository.save(refund);

        return PaymentDto.RefundResponse.builder()
                .refundId(saved.getId())
                .paymentId(payment.getId())
                .amount(saved.getAmount())
                .status(saved.getStatus())
                .build();
    }
}
