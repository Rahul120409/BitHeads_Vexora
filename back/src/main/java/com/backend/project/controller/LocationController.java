package com.backend.project.controller;

import com.backend.project.dto.LocationDto;
import com.backend.project.service.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LocationController {

    private final LocationService locationService;

    // 1. SAVE STATE
    @PostMapping("/states")
    public ResponseEntity<?> saveState(@RequestBody LocationDto.StateRequest request) {
        try {
            return ResponseEntity.ok(locationService.saveState(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 2. GET ALL STATES
    @GetMapping("/states")
    public ResponseEntity<List<LocationDto.StateResponse>> getAllStates() {
        return ResponseEntity.ok(locationService.getAllStates());
    }

    // 3. SAVE CITY (By selecting state, entering cityCode and cityName)
    @PostMapping("/cities")
    public ResponseEntity<?> saveCity(@RequestBody LocationDto.CityRequest request) {
        try {
            return ResponseEntity.ok(locationService.saveCity(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 4. GET CITIES (Optionally filter by ?stateId=...)
    @GetMapping("/cities")
    public ResponseEntity<List<LocationDto.CityResponse>> getCities(@RequestParam(required = false) Long stateId) {
        return ResponseEntity.ok(locationService.getCities(stateId));
    }
}
