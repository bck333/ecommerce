package com.ecommerce.cart.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

public class CartDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddItemRequest {
        @NotNull(message = "Product ID is required")
        private Long productId;

        @Min(value = 1, message = "Quantity must be at least 1")
        private int quantity;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateItemRequest {
        @Min(value = 0, message = "Quantity must be at least 0")
        private int quantity;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long cartId;
        private List<ItemResponse> items;
        private int totalItems;
        private BigDecimal subtotal;
        private BigDecimal deliveryFee;
        private BigDecimal discount;
        private BigDecimal totalAmount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemResponse {
        private Long id;
        private Long productId;
        private String productName;
        private String productSlug;
        private String brand;
        private String unit;
        private String quantityDescription;
        private String image;
        private BigDecimal unitPrice;
        private BigDecimal mrp;
        private int quantity;
        private BigDecimal itemTotal;
        private int maxAvailableStock;
    }
}
