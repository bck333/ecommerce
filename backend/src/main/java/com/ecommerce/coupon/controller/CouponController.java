package com.ecommerce.coupon.controller;

import com.ecommerce.common.response.ApiResponse;
import com.ecommerce.coupon.dto.CouponDto;
import com.ecommerce.coupon.service.CouponService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
@Tag(name = "Coupons", description = "Validate promotional coupon codes and calculate discounts")
public class CouponController {

    private final CouponService couponService;

    @PostMapping("/validate")
    @Operation(summary = "Validate coupon code against order amount")
    public ResponseEntity<ApiResponse<CouponDto.ValidationResult>> validateCoupon(
            @Valid @RequestBody CouponDto.ValidateRequest request) {
        CouponDto.ValidationResult result = couponService.validateCoupon(request.getCode(), request.getOrderAmount());
        return ResponseEntity.ok(ApiResponse.success(result.getMessage(), result));
    }
}
