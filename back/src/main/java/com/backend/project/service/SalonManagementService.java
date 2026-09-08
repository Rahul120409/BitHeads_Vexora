package com.backend.project.service;

import com.backend.project.dto.SalonDto;
import com.backend.project.entity.Salon;
import com.backend.project.repository.SalonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SalonManagementService {

    private final SalonRepository salonRepository;

    @Transactional(readOnly = true)
    public List<SalonDto.SalonResponse> getAllSalons() {
        return salonRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SalonDto.SalonResponse getSalonById(Long id) {
        Salon salon = salonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Salon not found with id " + id));
        return mapToResponse(salon);
    }

    @Transactional
    public SalonDto.SalonResponse saveSalon(SalonDto.SalonRequest request) {
        Salon salon = Salon.builder()
                .name(request.getName())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .phone(request.getPhone())
                .pincode(request.getPincode())
                .salonType(request.getSalonType())
                .email(request.getEmail())
                .operatingTimings(request.getOperatingTimings())
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .build();

        Salon saved = salonRepository.save(salon);
        return mapToResponse(saved);
    }

    @Transactional
    public SalonDto.SalonResponse updateSalon(Long id, SalonDto.SalonRequest request) {
        Salon salon = salonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Salon not found with id " + id));

        if (request.getName() != null) salon.setName(request.getName());
        if (request.getAddress() != null) salon.setAddress(request.getAddress());
        if (request.getCity() != null) salon.setCity(request.getCity());
        if (request.getState() != null) salon.setState(request.getState());
        if (request.getPhone() != null) salon.setPhone(request.getPhone());
        if (request.getPincode() != null) salon.setPincode(request.getPincode());
        if (request.getSalonType() != null) salon.setSalonType(request.getSalonType());
        if (request.getEmail() != null) salon.setEmail(request.getEmail());
        if (request.getOperatingTimings() != null) salon.setOperatingTimings(request.getOperatingTimings());
        if (request.getStatus() != null) salon.setStatus(request.getStatus());

        Salon updated = salonRepository.save(salon);
        return mapToResponse(updated);
    }

    private SalonDto.SalonResponse mapToResponse(Salon salon) {
        return SalonDto.SalonResponse.builder()
                .id(salon.getId())
                .name(salon.getName())
                .address(salon.getAddress())
                .city(salon.getCity())
                .state(salon.getState())
                .phone(salon.getPhone())
                .pincode(salon.getPincode())
                .salonType(salon.getSalonType())
                .email(salon.getEmail())
                .operatingTimings(salon.getOperatingTimings())
                .status(salon.getStatus())
                .build();
    }
}
