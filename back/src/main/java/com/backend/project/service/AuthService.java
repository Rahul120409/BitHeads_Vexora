package com.backend.project.service;

import com.backend.project.dto.AuthDto;
import com.backend.project.entity.Staff;
import com.backend.project.entity.User;
import com.backend.project.enums.Role;
import com.backend.project.repository.StaffRepository;
import com.backend.project.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final StaffRepository staffRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public AuthDto.LoginResponse login(AuthDto.LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials: user not found"));

        boolean matches = passwordEncoder.matches(request.getPassword(), user.getPassword()) 
                || user.getPassword().equals(request.getPassword()); // Fallback for pre-existing plain text passwords

        if (!matches) {
            throw new RuntimeException("Invalid credentials: incorrect password");
        }

        // If user was using plaintext, upgrade it to bcrypt automatically
        if (user.getPassword().equals(request.getPassword()) && !request.getPassword().startsWith("$2a$")) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            userRepository.save(user);
        }

        Long staffId = null;
        if (user.getRole() == Role.STAFF) {
            Optional<Staff> staffOpt = staffRepository.findByUserId(user.getId());
            if (staffOpt.isPresent()) {
                staffId = staffOpt.get().getId();
            }
        }

        return AuthDto.LoginResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .mobileNumber(user.getMobileNumber())
                .role(user.getRole())
                .userType(user.getUserType() != null ? user.getUserType() : user.getRole().name())
                .staffId(staffId)
                .token("mock-jwt-token-" + user.getId())
                .build();
    }

    public AuthDto.LoginResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already registered");
        }

        // Validate password & confirm password if provided
        String cnf = request.getConfirmPassword() != null ? request.getConfirmPassword() : request.getCnfPassword();
        if (cnf != null && !cnf.isBlank() && !cnf.equals(request.getPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        Role assignedRole = request.getRole() != null ? request.getRole() : Role.CUSTOMER;
        String userType = request.getUserType() != null && !request.getUserType().isBlank()
                ? request.getUserType()
                : assignedRole.name();

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .mobileNumber(request.getMobileNumber())
                .role(assignedRole)
                .userType(userType)
                .build();

        User saved = userRepository.save(user);

        return AuthDto.LoginResponse.builder()
                .id(saved.getId())
                .name(saved.getName())
                .email(saved.getEmail())
                .mobileNumber(saved.getMobileNumber())
                .role(saved.getRole())
                .userType(saved.getUserType())
                .token("mock-jwt-token-" + saved.getId())
                .build();
    }
}
