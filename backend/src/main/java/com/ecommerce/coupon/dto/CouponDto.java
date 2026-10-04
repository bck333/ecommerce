package com.ecommerce.coupon.dto;

import com.ecommerce.coupon.enums.DiscountType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

public class CouponDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ValidateRequest {
        @NotBlank(message = "Coupon code is required")
        private String code;

        @NotNull(message = "Order amount is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Order amount must be greater than 0")
        private BigDecimal orderAmount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ValidationResult {
        private boolean valid;
        private String code;
        private String description;
        private DiscountType discountType;
        private BigDecimal discountValue;
        private BigDecimal discountAmount;
        private BigDecimal finalAmount;
        private String message;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String code;
        private String description;
        private DiscountType discountType;
        private BigDecimal discountValue;
        private BigDecimal minimumOrderAmount;
        private BigDecimal maximumDiscount;
        private boolean active;
    }
}
