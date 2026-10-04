package com.ecommerce.admin.dto;

import com.ecommerce.coupon.enums.DiscountType;
import com.ecommerce.order.enums.OrderStatus;
import com.ecommerce.order.enums.PaymentStatus;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class AdminDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardStats {
        private long totalUsers;
        private long totalOrders;
        private long todayOrders;
        private BigDecimal todayRevenue;
        private BigDecimal totalRevenue;
        private long totalProducts;
        private long lowStockProducts;
        private long pendingOrders;
        private long deliveredOrders;
        private long cancelledOrders;
        private List<SalesTrend> salesTrend;
        private List<RecentOrder> recentOrders;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SalesTrend {
        private String date;
        private BigDecimal revenue;
        private long orders;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentOrder {
        private Long id;
        private String orderNumber;
        private String customerName;
        private String customerMobile;
        private BigDecimal amount;
        private OrderStatus status;
        private LocalDateTime date;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductForm {
        @NotBlank(message = "Product name is required")
        private String name;

        private String slug;

        @NotNull(message = "Category is required")
        private Long categoryId;

        private Long subcategoryId;

        private String description;

        private String brand;

        @NotBlank(message = "SKU is required")
        private String sku;

        @NotNull(message = "Selling price is required")
        @DecimalMin("0.0")
        private BigDecimal price;

        @NotNull(message = "MRP is required")
        @DecimalMin("0.0")
        private BigDecimal mrp;

        @NotBlank(message = "Unit is required")
        private String unit;

        @NotBlank(message = "Quantity description is required")
        private String quantity;

        @Min(0)
        private int stockQuantity;

        @NotBlank(message = "Image URL is required")
        private String image;

        private boolean featured;
        private boolean active;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryForm {
        @NotBlank(message = "Category name is required")
        private String name;

        private String slug;
        private String description;
        private String image;
        private int displayOrder;
        private boolean active;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubCategoryForm {
        @NotNull(message = "Category ID is required")
        private Long categoryId;

        @NotBlank(message = "Subcategory name is required")
        private String name;

        private String slug;
        private String image;
        private int displayOrder;
        private boolean active;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CouponForm {
        @NotBlank(message = "Coupon code is required")
        private String code;

        private String description;

        @NotNull(message = "Discount type is required")
        private DiscountType discountType;

        @NotNull(message = "Discount value is required")
        @DecimalMin("0.0")
        private BigDecimal discountValue;

        private BigDecimal minimumOrderAmount;
        private BigDecimal maximumDiscount;
        private LocalDateTime startDate;

        @NotNull(message = "Expiry date is required")
        private LocalDateTime expiryDate;

        private int usageLimit;
        private boolean active;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BannerForm {
        @NotBlank(message = "Title is required")
        private String title;

        @NotBlank(message = "Image URL is required")
        private String image;

        private String link;
        private int displayOrder;
        private boolean active;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeliveryAreaForm {
        @NotBlank(message = "Pincode is required")
        private String pincode;

        @NotBlank(message = "City is required")
        private String city;

        @NotBlank(message = "State is required")
        private String state;

        private boolean deliveryAvailable;

        @NotNull(message = "Delivery fee is required")
        private BigDecimal deliveryFee;

        @NotNull(message = "Minimum order amount is required")
        private BigDecimal minimumOrderAmount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateOrderStatus {
        @NotNull(message = "Order status is required")
        private OrderStatus orderStatus;

        private PaymentStatus paymentStatus;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserListItem {
        private Long id;
        private String mobileNumber;
        private String name;
        private String email;
        private boolean profileCompleted;
        private boolean active;
        private int totalOrders;
        private LocalDateTime createdAt;
    }
}
