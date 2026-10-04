package com.ecommerce.auth.dto;

import com.ecommerce.user.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private boolean success;
    private boolean newUser;
    private String message;
    private String token;
    private UserSummary user;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserSummary {
        private Long id;
        private String mobileNumber;
        private String name;
        private String email;
        private Role role;
        private boolean profileCompleted;
    }
}
