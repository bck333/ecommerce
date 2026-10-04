package com.ecommerce.category.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubCategoryDto {
    private Long id;
    private Long categoryId;
    private String name;
    private String slug;
    private String image;
    private int displayOrder;
}
