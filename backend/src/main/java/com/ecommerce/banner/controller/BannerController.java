package com.ecommerce.banner.controller;

import com.ecommerce.banner.dto.BannerDto;
import com.ecommerce.banner.service.BannerService;
import com.ecommerce.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/banners")
@RequiredArgsConstructor
@Tag(name = "Banners", description = "Homepage promotional banners and campaign links")
public class BannerController {

    private final BannerService bannerService;

    @GetMapping
    @Operation(summary = "Get all active homepage banners in display order")
    public ResponseEntity<ApiResponse<List<BannerDto>>> getBanners() {
        return ResponseEntity.ok(ApiResponse.success(bannerService.getActiveBanners()));
    }
}
