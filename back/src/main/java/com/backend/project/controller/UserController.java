package com.backend.project.controller;

import com.backend.project.dto.AuthDto;
import com.backend.project.entity.User;
import com.backend.project.enums.Role;
import com.backend.project.repository.UserRepository;
import com.backend.project.service.AuthService;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserRepository userRepository;
    private final AuthService authService;

    @Getter
    @Setter
    @Builder
    public static class UserResponse {
        private Long id;
        private String name;
        private String email;
        private String mobileNumber;
        private Role role;
        private String userType;
        private LocalDateTime createdAt;
    }

    // 1. FETCH ALL USERS
    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers(@RequestParam(required = false) Role role) {
        List<User> users = userRepository.findAll();
        if (role != null) {
            users = users.stream().filter(u -> u.getRole() == role).collect(Collectors.toList());
        }
        List<UserResponse> response = users.stream().map(this::mapToResponse).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    // 2. FETCH USER BY ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(u -> ResponseEntity.ok(mapToResponse(u)))
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. CREATE USER (POST /api/users)
    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody AuthDto.RegisterRequest request) {
        try {
            return ResponseEntity.ok(authService.register(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .mobileNumber(user.getMobileNumber())
                .role(user.getRole())
                .userType(user.getUserType() != null ? user.getUserType() : user.getRole().name())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
