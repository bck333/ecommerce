package com.ecommerce.coupon.service;

import com.ecommerce.coupon.dto.CouponDto;
import com.ecommerce.coupon.entity.Coupon;
import com.ecommerce.coupon.enums.DiscountType;
import com.ecommerce.coupon.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;

    public CouponDto.ValidationResult validateCoupon(String code, BigDecimal orderAmount) {
        Optional<Coupon> couponOpt = couponRepository.findByCodeIgnoreCaseAndActiveTrue(code);

        if (couponOpt.isEmpty()) {
            return CouponDto.ValidationResult.builder()
                    .valid(false)
                    .code(code)
                    .discountAmount(BigDecimal.ZERO)
                    .finalAmount(orderAmount)
                    .message("Invalid or expired coupon code")
                    .build();
        }

        Coupon coupon = couponOpt.get();
        LocalDateTime now = LocalDateTime.now();

        if (now.isBefore(coupon.getStartDate()) || now.isAfter(coupon.getExpiryDate())) {
            return CouponDto.ValidationResult.builder()
                    .valid(false)
                    .code(code)
                    .discountAmount(BigDecimal.ZERO)
                    .finalAmount(orderAmount)
                    .message("This coupon has expired")
                    .build();
        }

        if (coupon.getTimesUsed() >= coupon.getUsageLimit()) {
            return CouponDto.ValidationResult.builder()
                    .valid(false)
                    .code(code)
                    .discountAmount(BigDecimal.ZERO)
                    .finalAmount(orderAmount)
                    .message("This coupon usage limit has been reached")
                    .build();
        }

        if (orderAmount.compareTo(coupon.getMinimumOrderAmount()) < 0) {
            return CouponDto.ValidationResult.builder()
                    .valid(false)
                    .code(code)
                    .discountAmount(BigDecimal.ZERO)
                    .finalAmount(orderAmount)
                    .message(String.format("Minimum order amount of ₹%.2f required to apply this coupon",
                            coupon.getMinimumOrderAmount()))
                    .build();
        }

        BigDecimal discount = BigDecimal.ZERO;
        if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
            discount = orderAmount.multiply(coupon.getDiscountValue())
                    .divide(new BigDecimal("100.00"), 2, RoundingMode.HALF_UP);
            if (coupon.getMaximumDiscount() != null && discount.compareTo(coupon.getMaximumDiscount()) > 0) {
                discount = coupon.getMaximumDiscount();
            }
        } else if (coupon.getDiscountType() == DiscountType.FIXED) {
            discount = coupon.getDiscountValue();
        }

        // Discount cannot be greater than order amount
        if (discount.compareTo(orderAmount) > 0) {
            discount = orderAmount;
        }

        BigDecimal finalAmount = orderAmount.subtract(discount);

        return CouponDto.ValidationResult.builder()
                .valid(true)
                .code(coupon.getCode())
                .description(coupon.getDescription())
                .discountType(coupon.getDiscountType())
                .discountValue(coupon.getDiscountValue())
                .discountAmount(discount)
                .finalAmount(finalAmount)
                .message("Coupon applied successfully!")
                .build();
    }
}
