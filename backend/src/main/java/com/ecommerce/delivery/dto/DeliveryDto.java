package com.ecommerce.delivery.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

public class DeliveryDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CheckRequest {
        @NotBlank(message = "Pincode is required")
        private String pincode;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private boolean serviceable;
        private String pincode;
        private String city;
        private String state;
        private BigDecimal deliveryFee;
        private BigDecimal minimumOrderAmount;
        private String estimatedDeliveryTime;
        private String message;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AreaDto {
        private Long id;
        private String pincode;
        private String city;
        private String state;
        private boolean deliveryAvailable;
        private BigDecimal deliveryFee;
        private BigDecimal minimumOrderAmount;
    }
}
