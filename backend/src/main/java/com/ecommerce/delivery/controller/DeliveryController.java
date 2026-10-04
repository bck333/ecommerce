package com.ecommerce.delivery.controller;

import com.ecommerce.common.response.ApiResponse;
import com.ecommerce.delivery.dto.DeliveryDto;
import com.ecommerce.delivery.service.DeliveryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/delivery")
@RequiredArgsConstructor
@Tag(name = "Delivery Serviceability", description = "Check pincode serviceability and delivery zones")
public class DeliveryController {

    private final DeliveryService deliveryService;

    @PostMapping("/check")
    @Operation(summary = "Check if delivery is available for a pincode")
    public ResponseEntity<ApiResponse<DeliveryDto.Response>> checkPincode(
            @Valid @RequestBody DeliveryDto.CheckRequest request) {
        DeliveryDto.Response result = deliveryService.checkPincode(request.getPincode());
        return ResponseEntity.ok(ApiResponse.success(result.getMessage(), result));
    }

    @GetMapping("/pincodes")
    @Operation(summary = "Get list of all configured service areas")
    public ResponseEntity<ApiResponse<List<DeliveryDto.AreaDto>>> getPincodes() {
        return ResponseEntity.ok(ApiResponse.success(deliveryService.getAllPincodes()));
    }
}
