package com.ecommerce.auth.controller;

import com.ecommerce.auth.dto.AuthResponse;
import com.ecommerce.auth.dto.SendOtpRequest;
import com.ecommerce.auth.dto.VerifyOtpRequest;
import com.ecommerce.auth.service.AuthService;
import com.ecommerce.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Mobile + OTP authentication for grocery customers")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/send-otp")
    @Operation(summary = "Send OTP to mobile number")
    public ResponseEntity<ApiResponse<String>> sendOtp(@Valid @RequestBody SendOtpRequest request) {
        authService.sendOtp(request);
        return ResponseEntity.ok(ApiResponse.success("OTP sent successfully to " + request.getMobileNumber(), null));
    }

    @PostMapping("/resend-otp")
    @Operation(summary = "Resend OTP to mobile number with cooldown check")
    public ResponseEntity<ApiResponse<String>> resendOtp(@Valid @RequestBody SendOtpRequest request) {
        authService.sendOtp(request);
        return ResponseEntity.ok(ApiResponse.success("OTP resent successfully to " + request.getMobileNumber(), null));
    }

    @PostMapping("/verify-otp")
    @Operation(summary = "Verify OTP and login or auto-register customer")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        AuthResponse response = authService.verifyOtp(request);
        return ResponseEntity.ok(ApiResponse.success(response.getMessage(), response));
    }

    @PostMapping("/logout")
    @Operation(summary = "Customer logout")
    public ResponseEntity<ApiResponse<String>> logout() {
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
    }
}
