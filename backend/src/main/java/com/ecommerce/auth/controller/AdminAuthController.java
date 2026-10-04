package com.ecommerce.auth.controller;

import com.ecommerce.auth.dto.AdminLoginRequest;
import com.ecommerce.auth.dto.AuthResponse;
import com.ecommerce.auth.service.AuthService;
import com.ecommerce.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/auth")
@RequiredArgsConstructor
@Tag(name = "Admin Authentication", description = "Admin panel authentication")
public class AdminAuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Admin login with email/username and password")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AdminLoginRequest request) {
        AuthResponse response = authService.adminLogin(request);
        return ResponseEntity.ok(ApiResponse.success("Admin login successful", response));
    }
}
