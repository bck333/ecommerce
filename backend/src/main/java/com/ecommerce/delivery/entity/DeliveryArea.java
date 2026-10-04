package com.ecommerce.delivery.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "delivery_areas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryArea {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 10)
    private String pincode;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(nullable = false, length = 100)
    private String state;

    @Column(name = "delivery_available", nullable = false)
    @Builder.Default
    private boolean deliveryAvailable = true;

    @Column(name = "delivery_fee", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal deliveryFee = new BigDecimal("25.00");

    @Column(name = "minimum_order_amount", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal minimumOrderAmount = new BigDecimal("99.00");

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
