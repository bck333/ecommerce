package com.ecommerce.product.controller;

import com.ecommerce.common.response.ApiResponse;
import com.ecommerce.product.dto.ProductDto;
import com.ecommerce.product.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Products", description = "Product catalog, filtering, sorting, and search")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "Get filtered and paginated product list")
    public ResponseEntity<ApiResponse<Page<ProductDto>>> getProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long subcategoryId,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Boolean inStock,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Page<ProductDto> products = productService.getFilteredProducts(
                categoryId, subcategoryId, brand, minPrice, maxPrice, inStock, page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/search")
    @Operation(summary = "Search products by name, brand, or category")
    public ResponseEntity<ApiResponse<Page<ProductDto>>> searchProducts(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<ProductDto> products = productService.searchProducts(query, page, size);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/featured")
    @Operation(summary = "Get top featured products for homepage deals")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getFeaturedProducts() {
        return ResponseEntity.ok(ApiResponse.success(productService.getFeaturedProducts()));
    }

    @GetMapping("/popular")
    @Operation(summary = "Get best seller popular products")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getPopularProducts() {
        return ResponseEntity.ok(ApiResponse.success(productService.getPopularProducts()));
    }

    @GetMapping("/brands")
    @Operation(summary = "Get all active brands for filter sidebar")
    public ResponseEntity<ApiResponse<List<String>>> getBrands() {
        return ResponseEntity.ok(ApiResponse.success(productService.getAllBrands()));
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Get product details by slug")
    public ResponseEntity<ApiResponse<ProductDto>> getProductBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.success(productService.getProductBySlug(slug)));
    }
}
