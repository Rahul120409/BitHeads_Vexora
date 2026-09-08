package com.backend.project.controller;

import com.backend.project.dto.HaircutStyleDto;
import com.backend.project.service.SalonServiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/haircut-styles")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class HaircutStyleController {

    private final SalonServiceService serviceService;

    // 1. SAVE / CREATE HAIRCUT STYLE
    @PostMapping
    public ResponseEntity<?> saveHaircutStyle(@RequestBody HaircutStyleDto.Request request) {
        try {
            return ResponseEntity.ok(serviceService.saveStyle(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 2. FETCH HAIRCUT STYLES (All or by ?salonId=...)
    @GetMapping
    public ResponseEntity<List<HaircutStyleDto.Response>> getHaircutStyles(@RequestParam(required = false) Long salonId) {
        return ResponseEntity.ok(serviceService.getStyles(salonId));
    }

    // 2b. FETCH HAIRCUT STYLES FOR SPECIFIC SALON (/salon/{salonId})
    @GetMapping("/salon/{salonId}")
    public ResponseEntity<List<HaircutStyleDto.Response>> getHaircutStylesBySalon(@PathVariable Long salonId) {
        return ResponseEntity.ok(serviceService.getStyles(salonId));
    }

    // 3. FETCH HAIRCUT STYLE BY ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getHaircutStyleById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(serviceService.getStyleById(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 4. UPDATE HAIRCUT STYLE
    @PutMapping("/{id}")
    public ResponseEntity<?> updateHaircutStyle(@PathVariable Long id, @RequestBody HaircutStyleDto.Request request) {
        try {
            return ResponseEntity.ok(serviceService.updateStyle(id, request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
