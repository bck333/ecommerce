package com.ecommerce.user.controller;

import com.ecommerce.auth.dto.AuthResponse;
import com.ecommerce.common.response.ApiResponse;
import com.ecommerce.security.UserPrincipal;
import com.ecommerce.user.dto.AddressDto;
import com.ecommerce.user.dto.CreateAddressRequest;
import com.ecommerce.user.dto.UpdateProfileRequest;
import com.ecommerce.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User Profile & Addresses", description = "Customer profile management and delivery addresses")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Get current customer profile")
    public ResponseEntity<ApiResponse<AuthResponse.UserSummary>> getProfile(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        AuthResponse.UserSummary profile = userService.getUserProfile(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PutMapping("/profile")
    @Operation(summary = "Complete or update customer profile (name, email)")
    public ResponseEntity<ApiResponse<AuthResponse.UserSummary>> updateProfile(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody UpdateProfileRequest request) {
        AuthResponse.UserSummary updated = userService.updateProfile(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }

    @GetMapping("/addresses")
    @Operation(summary = "Get all customer saved addresses")
    public ResponseEntity<ApiResponse<List<AddressDto>>> getAddresses(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<AddressDto> addresses = userService.getUserAddresses(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(addresses));
    }

    @PostMapping("/addresses")
    @Operation(summary = "Add a new delivery address")
    public ResponseEntity<ApiResponse<AddressDto>> addAddress(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody CreateAddressRequest request) {
        AddressDto address = userService.addAddress(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Address added successfully", address));
    }

    @PutMapping("/addresses/{id}")
    @Operation(summary = "Update an existing delivery address")
    public ResponseEntity<ApiResponse<AddressDto>> updateAddress(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id,
            @Valid @RequestBody CreateAddressRequest request) {
        AddressDto address = userService.updateAddress(currentUser.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Address updated successfully", address));
    }

    @DeleteMapping("/addresses/{id}")
    @Operation(summary = "Delete a delivery address")
    public ResponseEntity<ApiResponse<String>> deleteAddress(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id) {
        userService.deleteAddress(currentUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Address deleted successfully", null));
    }
}
