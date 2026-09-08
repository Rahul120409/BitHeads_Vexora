package com.backend.project.controller;

import com.backend.project.dto.AppointmentDto;
import com.backend.project.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    public ResponseEntity<?> bookAppointment(@RequestBody AppointmentDto.BookRequest request) {
        try {
            return ResponseEntity.ok(appointmentService.bookAppointment(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<AppointmentDto.AppointmentResponse>> getAllAppointments() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }

    @GetMapping("/customer/{id}")
    public ResponseEntity<List<AppointmentDto.AppointmentResponse>> getCustomerAppointments(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.getCustomerAppointments(id));
    }

    @GetMapping("/today")
    public ResponseEntity<List<AppointmentDto.AppointmentResponse>> getTodayAppointments() {
        return ResponseEntity.ok(appointmentService.getTodayAppointments());
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelAppointment(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(appointmentService.cancelAppointment(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
