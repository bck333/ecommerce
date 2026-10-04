package com.ecommerce.order.dto;

import com.ecommerce.order.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {

    @NotNull(message = "Delivery address is required")
    private Long addressId;

    @NotNull(message = "Payment method is required")
    @Builder.Default
    private PaymentMethod paymentMethod = PaymentMethod.CASH_ON_DELIVERY;

    private String couponCode;
}
