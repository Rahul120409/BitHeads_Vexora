package com.backend.project.controller;

import com.backend.project.dto.StaffDto;
import com.backend.project.service.StaffManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StaffController {

    private final StaffManagementService staffService;

    // 1. SAVE / CREATE NEW STYLIST / STAFF
    @PostMapping
    public ResponseEntity<?> createStaff(@RequestBody StaffDto.Request request) {
        try {
            return ResponseEntity.ok(staffService.saveStaff(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 2. FETCH ALL STAFF (Optionally filter by ?salonId=...)
    @GetMapping
    public ResponseEntity<List<StaffDto.Response>> getAllStaff(@RequestParam(required = false) Long salonId) {
        return ResponseEntity.ok(staffService.getAllStaff(salonId));
    }

    // 2b. FETCH STAFF FOR SPECIFIC SALON (/salon/{salonId})
    @GetMapping("/salon/{salonId}")
    public ResponseEntity<List<StaffDto.Response>> getStaffBySalon(@PathVariable Long salonId) {
        return ResponseEntity.ok(staffService.getAllStaff(salonId));
    }

    // 3. FETCH STAFF BY ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getStaffById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(staffService.getStaffById(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 4. UPDATE STAFF DETAILS
    @PutMapping("/{id}")
    public ResponseEntity<?> updateStaff(@PathVariable Long id, @RequestBody StaffDto.Request request) {
        try {
            return ResponseEntity.ok(staffService.updateStaff(id, request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 5. UPDATE DUTY STATUS (AVAILABLE, BUSY, BREAK, OFFLINE)
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateDutyStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String status = body.getOrDefault("dutyStatus", body.get("status"));
            if (status == null) {
                return ResponseEntity.badRequest().body("dutyStatus or status is required");
            }
            return ResponseEntity.ok(staffService.updateDutyStatus(id, status));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
