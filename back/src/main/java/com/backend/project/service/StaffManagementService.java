package com.backend.project.service;

import com.backend.project.dto.StaffDto;
import com.backend.project.entity.Salon;
import com.backend.project.entity.Staff;
import com.backend.project.enums.StaffStatus;
import com.backend.project.repository.SalonRepository;
import com.backend.project.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StaffManagementService {

    private final StaffRepository staffRepository;
    private final SalonRepository salonRepository;

    @Transactional
    public StaffDto.Response saveStaff(StaffDto.Request request) {
        Salon salon = null;
        if (request.getSalonId() != null) {
            salon = salonRepository.findById(request.getSalonId()).orElse(null);
        } else {
            List<Salon> salons = salonRepository.findAll();
            if (!salons.isEmpty()) {
                salon = salons.get(0);
            }
        }

        Staff staff = Staff.builder()
                .salon(salon)
                .name(request.getEffectiveName())
                .mobileNumber(request.getEffectiveMobile())
                .specialization(request.getEffectiveSpecialization())
                .email(request.getEmail())
                .status(request.getEffectiveStatus())
                .build();

        Staff saved = staffRepository.save(staff);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<StaffDto.Response> getAllStaff(Long salonId) {
        List<Staff> staffList = (salonId != null)
                ? staffRepository.findBySalonId(salonId)
                : staffRepository.findAll();

        return staffList.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StaffDto.Response getStaffById(Long id) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Staff member not found with id " + id));
        return mapToResponse(staff);
    }

    @Transactional
    public StaffDto.Response updateStaff(Long id, StaffDto.Request request) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Staff member not found with id " + id));

        if (request.getStylistName() != null || request.getName() != null) {
            staff.setName(request.getEffectiveName());
        }
        if (request.getMobileNumber() != null || request.getPhone() != null) {
            staff.setMobileNumber(request.getEffectiveMobile());
        }
        if (request.getSpecialization() != null || request.getSpecialist() != null) {
            staff.setSpecialization(request.getEffectiveSpecialization());
        }
        if (request.getEmail() != null) {
            staff.setEmail(request.getEmail());
        }
        if (request.getDutyStatus() != null || request.getStatus() != null) {
            staff.setStatus(request.getEffectiveStatus());
        }

        Staff updated = staffRepository.save(staff);
        return mapToResponse(updated);
    }

    @Transactional
    public StaffDto.Response updateDutyStatus(Long id, String dutyStatus) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Staff member not found with id " + id));

        try {
            staff.setStatus(StaffStatus.valueOf(dutyStatus.trim().toUpperCase()));
        } catch (Exception e) {
            throw new RuntimeException("Invalid duty status. Allowed: AVAILABLE, BUSY, BREAK, OFFLINE");
        }

        Staff updated = staffRepository.save(staff);
        return mapToResponse(updated);
    }

    public StaffDto.Response mapToResponse(Staff staff) {
        String duty = staff.getStatus() != null ? staff.getStatus().name() : "AVAILABLE";
        return StaffDto.Response.builder()
                .id(staff.getId())
                .salonId(staff.getSalon() != null ? staff.getSalon().getId() : null)
                .salonName(staff.getSalon() != null ? staff.getSalon().getName() : null)
                .stylistName(staff.getName())
                .name(staff.getName())
                .mobileNumber(staff.getMobileNumber())
                .phone(staff.getMobileNumber())
                .specialization(staff.getSpecialization())
                .email(staff.getEmail())
                .dutyStatus(duty)
                .status(duty)
                .build();
    }
}
