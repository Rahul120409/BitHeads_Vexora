package com.backend.project.controller;

import com.backend.project.dto.PaymentDto;
import com.backend.project.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/payments")
    public ResponseEntity<?> processPayment(@RequestBody PaymentDto.PaymentRequest request) {
        try {
            return ResponseEntity.ok(paymentService.processPayment(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/refunds")
    public ResponseEntity<?> processRefund(@RequestBody PaymentDto.RefundRequest request) {
        try {
            return ResponseEntity.ok(paymentService.processRefund(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
