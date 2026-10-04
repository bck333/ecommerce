package com.ecommerce.category.controller;

import com.ecommerce.category.dto.CategoryDto;
import com.ecommerce.category.dto.SubCategoryDto;
import com.ecommerce.category.service.CategoryService;
import com.ecommerce.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Tag(name = "Categories", description = "Browse categories and subcategories")
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    @Operation(summary = "Get all active categories with subcategories")
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getAllCategories() {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getAllActiveCategories()));
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Get category details by slug")
    public ResponseEntity<ApiResponse<CategoryDto>> getCategoryBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getCategoryBySlug(slug)));
    }

    @GetMapping("/{id}/subcategories")
    @Operation(summary = "Get subcategories by category ID")
    public ResponseEntity<ApiResponse<List<SubCategoryDto>>> getSubcategories(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getSubcategoriesByCategory(id)));
    }
}
