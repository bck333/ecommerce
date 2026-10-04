package com.ecommerce.auth.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminLoginRequest {

    @NotBlank(message = "Username, email, or mobile number is required")
    @JsonAlias({"emailOrMobile", "email", "username", "mobile"})
    private String usernameOrMobile;

    @NotBlank(message = "Password is required")
    private String password;
}
