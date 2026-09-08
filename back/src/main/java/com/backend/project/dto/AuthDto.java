package com.backend.project.dto;

import com.backend.project.enums.Role;
import lombok.*;

public class AuthDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest {
        private String email;
        private String password;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LoginResponse {
        private Long id;
        private String name;
        private String email;
        private String mobileNumber;
        private Role role;
        private String userType;
        private Long staffId; // Included if user is STAFF
        private String token;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegisterRequest {
        private String name;
        private String email;
        private String mobileNumber;
        private String password;
        private String confirmPassword;
        private String cnfPassword;
        private Role role = Role.CUSTOMER;
        private String userType;
    }
}
