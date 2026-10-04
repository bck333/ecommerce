package com.ecommerce.banner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BannerDto {
    private Long id;
    private String title;
    private String image;
    private String link;
    private int displayOrder;
}
