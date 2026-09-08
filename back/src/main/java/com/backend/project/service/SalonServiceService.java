package com.backend.project.service;

import com.backend.project.dto.HaircutStyleDto;
import com.backend.project.entity.Salon;
import com.backend.project.entity.SalonService;
import com.backend.project.repository.SalonRepository;
import com.backend.project.repository.SalonServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SalonServiceService {

    private final SalonServiceRepository serviceRepository;
    private final SalonRepository salonRepository;

    @Transactional(readOnly = true)
    public List<SalonService> getAllServices() {
        return serviceRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<HaircutStyleDto.Response> getAllStyles() {
        return getStyles(null);
    }

    @Transactional(readOnly = true)
    public List<HaircutStyleDto.Response> getStyles(Long salonId) {
        List<SalonService> services = (salonId != null)
                ? serviceRepository.findBySalonId(salonId)
                : serviceRepository.findAll();
        return services.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public HaircutStyleDto.Response getStyleById(Long id) {
        SalonService service = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Haircut style / service not found with id " + id));
        return mapToResponse(service);
    }

    @Transactional
    public HaircutStyleDto.Response saveStyle(HaircutStyleDto.Request request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new RuntimeException("Haircut style name is required");
        }
        if (request.getPrice() == null) {
            throw new RuntimeException("Price is required");
        }

        Salon salon = null;
        if (request.getSalonId() != null) {
            salon = salonRepository.findById(request.getSalonId()).orElse(null);
        } else {
            // Default to first salon if exists
            List<Salon> salons = salonRepository.findAll();
            if (!salons.isEmpty()) {
                salon = salons.get(0);
            }
        }

        SalonService service = SalonService.builder()
                .salon(salon)
                .name(request.getName().trim())
                .gender(request.getGender() != null ? request.getGender().trim().toUpperCase() : "UNISEX")
                .price(request.getPrice())
                .durationMinutes(request.getEffectiveDuration())
                .description(request.getDescription())
                .imageUrl(request.getEffectiveImageUrl())
                .build();

        SalonService saved = serviceRepository.save(service);
        return mapToResponse(saved);
    }

    @Transactional
    public HaircutStyleDto.Response updateStyle(Long id, HaircutStyleDto.Request request) {
        SalonService service = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Haircut style / service not found with id " + id));

        if (request.getName() != null && !request.getName().isBlank()) {
            service.setName(request.getName().trim());
        }
        if (request.getGender() != null) {
            service.setGender(request.getGender().trim().toUpperCase());
        }
        if (request.getPrice() != null) {
            service.setPrice(request.getPrice());
        }
        if (request.getEffectiveDuration() != null) {
            service.setDurationMinutes(request.getEffectiveDuration());
        }
        if (request.getDescription() != null) {
            service.setDescription(request.getDescription());
        }
        if (request.getEffectiveImageUrl() != null) {
            service.setImageUrl(request.getEffectiveImageUrl());
        }

        SalonService updated = serviceRepository.save(service);
        return mapToResponse(updated);
    }

    public HaircutStyleDto.Response mapToResponse(SalonService service) {
        return HaircutStyleDto.Response.builder()
                .id(service.getId())
                .salonId(service.getSalon() != null ? service.getSalon().getId() : null)
                .name(service.getName())
                .gender(service.getGender())
                .price(service.getPrice())
                .durationMinutes(service.getDurationMinutes())
                .description(service.getDescription())
                .imageUrl(service.getImageUrl())
                .build();
    }
}
