package com.ecommerce.product.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDto {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private String categorySlug;
    private Long subcategoryId;
    private String subcategoryName;
    private String name;
    private String slug;
    private String description;
    private String brand;
    private String sku;
    private BigDecimal price;
    private BigDecimal mrp;
    private int discountPercentage;
    private String unit;
    private String quantity;
    private int stockQuantity;
    private String image;
    private boolean inStock;
    private boolean featured;
    private List<String> additionalImages;
}
