package com.backend.project.controller;

import com.backend.project.dto.HaircutStyleDto;
import com.backend.project.entity.SalonService;
import com.backend.project.service.SalonServiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ServiceController {

    private final SalonServiceService serviceService;

    // 1. FETCH ALL SERVICES / HAIRCUT STYLES (All or by ?salonId=...)
    @GetMapping
    public ResponseEntity<List<HaircutStyleDto.Response>> getAllServices(@RequestParam(required = false) Long salonId) {
        return ResponseEntity.ok(serviceService.getStyles(salonId));
    }

    // 1b. FETCH HAIRCUT STYLES FOR SPECIFIC SALON (/salon/{salonId})
    @GetMapping("/salon/{salonId}")
    public ResponseEntity<List<HaircutStyleDto.Response>> getServicesBySalon(@PathVariable Long salonId) {
        return ResponseEntity.ok(serviceService.getStyles(salonId));
    }

    // 2. FETCH SERVICE BY ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getServiceById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(serviceService.getStyleById(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 3. SAVE / CREATE HAIRCUT STYLE OR SERVICE
    @PostMapping
    public ResponseEntity<?> createService(@RequestBody HaircutStyleDto.Request request) {
        try {
            return ResponseEntity.ok(serviceService.saveStyle(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 4. UPDATE HAIRCUT STYLE OR SERVICE
    @PutMapping("/{id}")
    public ResponseEntity<?> updateService(@PathVariable Long id, @RequestBody HaircutStyleDto.Request request) {
        try {
            return ResponseEntity.ok(serviceService.updateStyle(id, request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
