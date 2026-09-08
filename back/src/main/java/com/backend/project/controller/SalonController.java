package com.backend.project.controller;

import com.backend.project.dto.SalonDto;
import com.backend.project.service.SalonManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/salons")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SalonController {

    private final SalonManagementService salonManagementService;

    @GetMapping
    public ResponseEntity<List<SalonDto.SalonResponse>> getAllSalons() {
        return ResponseEntity.ok(salonManagementService.getAllSalons());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSalonById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(salonManagementService.getSalonById(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createSalon(@RequestBody SalonDto.SalonRequest request) {
        try {
            return ResponseEntity.ok(salonManagementService.saveSalon(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSalon(@PathVariable Long id, @RequestBody SalonDto.SalonRequest request) {
        try {
            return ResponseEntity.ok(salonManagementService.updateSalon(id, request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
