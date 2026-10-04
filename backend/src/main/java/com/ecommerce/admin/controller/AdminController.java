package com.ecommerce.admin.controller;

import com.ecommerce.admin.dto.AdminDto;
import com.ecommerce.admin.service.AdminService;
import com.ecommerce.banner.entity.Banner;
import com.ecommerce.category.dto.CategoryDto;
import com.ecommerce.category.dto.SubCategoryDto;
import com.ecommerce.common.response.ApiResponse;
import com.ecommerce.common.storage.FileStorageService;
import com.ecommerce.coupon.entity.Coupon;
import com.ecommerce.delivery.entity.DeliveryArea;
import com.ecommerce.order.dto.OrderDto;
import com.ecommerce.order.enums.OrderStatus;
import com.ecommerce.product.dto.ProductDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin Operations", description = "Admin dashboard, catalog CRUD, orders, and system settings")
public class AdminController {

    private final AdminService adminService;
    private final FileStorageService fileStorageService;

    // Dashboard
    @GetMapping("/dashboard")
    @Operation(summary = "Get admin dashboard KPI metrics and sales trends")
    public ResponseEntity<ApiResponse<AdminDto.DashboardStats>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getDashboardStats()));
    }

    // Orders
    @GetMapping("/orders")
    @Operation(summary = "Get admin paginated orders with filter by status or search")
    public ResponseEntity<ApiResponse<Page<OrderDto>>> getOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getOrders(status, query, page, size)));
    }

    @PutMapping("/orders/{id}/status")
    @Operation(summary = "Update order and payment status")
    public ResponseEntity<ApiResponse<OrderDto>> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody AdminDto.UpdateOrderStatus request) {
        return ResponseEntity.ok(ApiResponse.success("Order status updated", adminService.updateOrderStatus(id, request)));
    }

    // Products
    @PostMapping("/products")
    @Operation(summary = "Create a new product")
    public ResponseEntity<ApiResponse<ProductDto>> createProduct(@Valid @RequestBody AdminDto.ProductForm form) {
        return ResponseEntity.ok(ApiResponse.success("Product created", adminService.createProduct(form)));
    }

    @PutMapping("/products/{id}")
    @Operation(summary = "Update an existing product")
    public ResponseEntity<ApiResponse<ProductDto>> updateProduct(@PathVariable Long id, @Valid @RequestBody AdminDto.ProductForm form) {
        return ResponseEntity.ok(ApiResponse.success("Product updated", adminService.updateProduct(id, form)));
    }

    @DeleteMapping("/products/{id}")
    @Operation(summary = "Delete a product")
    public ResponseEntity<ApiResponse<String>> deleteProduct(@PathVariable Long id) {
        adminService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted", null));
    }

    // Categories
    @PostMapping("/categories")
    @Operation(summary = "Create a category")
    public ResponseEntity<ApiResponse<CategoryDto>> createCategory(@Valid @RequestBody AdminDto.CategoryForm form) {
        return ResponseEntity.ok(ApiResponse.success("Category created", adminService.createCategory(form)));
    }

    @PutMapping("/categories/{id}")
    @Operation(summary = "Update a category")
    public ResponseEntity<ApiResponse<CategoryDto>> updateCategory(@PathVariable Long id, @Valid @RequestBody AdminDto.CategoryForm form) {
        return ResponseEntity.ok(ApiResponse.success("Category updated", adminService.updateCategory(id, form)));
    }

    @DeleteMapping("/categories/{id}")
    @Operation(summary = "Delete a category")
    public ResponseEntity<ApiResponse<String>> deleteCategory(@PathVariable Long id) {
        adminService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Category deleted", null));
    }

    // Subcategories
    @PostMapping("/subcategories")
    @Operation(summary = "Create a subcategory")
    public ResponseEntity<ApiResponse<SubCategoryDto>> createSubcategory(@Valid @RequestBody AdminDto.SubCategoryForm form) {
        return ResponseEntity.ok(ApiResponse.success("Subcategory created", adminService.createSubcategory(form)));
    }

    @DeleteMapping("/subcategories/{id}")
    @Operation(summary = "Delete a subcategory")
    public ResponseEntity<ApiResponse<String>> deleteSubcategory(@PathVariable Long id) {
        adminService.deleteSubcategory(id);
        return ResponseEntity.ok(ApiResponse.success("Subcategory deleted", null));
    }

    // Coupons
    @GetMapping("/coupons")
    @Operation(summary = "Get all coupons")
    public ResponseEntity<ApiResponse<List<Coupon>>> getAllCoupons() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllCoupons()));
    }

    @PostMapping("/coupons")
    @Operation(summary = "Create a new coupon")
    public ResponseEntity<ApiResponse<Coupon>> createCoupon(@Valid @RequestBody AdminDto.CouponForm form) {
        return ResponseEntity.ok(ApiResponse.success("Coupon created", adminService.createCoupon(form)));
    }

    @DeleteMapping("/coupons/{id}")
    @Operation(summary = "Delete a coupon")
    public ResponseEntity<ApiResponse<String>> deleteCoupon(@PathVariable Long id) {
        adminService.deleteCoupon(id);
        return ResponseEntity.ok(ApiResponse.success("Coupon deleted", null));
    }

    // Banners
    @GetMapping("/banners")
    @Operation(summary = "Get all banners")
    public ResponseEntity<ApiResponse<List<Banner>>> getAllBanners() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllBanners()));
    }

    @PostMapping("/banners")
    @Operation(summary = "Create a banner")
    public ResponseEntity<ApiResponse<Banner>> createBanner(@Valid @RequestBody AdminDto.BannerForm form) {
        return ResponseEntity.ok(ApiResponse.success("Banner created", adminService.createBanner(form)));
    }

    @DeleteMapping("/banners/{id}")
    @Operation(summary = "Delete a banner")
    public ResponseEntity<ApiResponse<String>> deleteBanner(@PathVariable Long id) {
        adminService.deleteBanner(id);
        return ResponseEntity.ok(ApiResponse.success("Banner deleted", null));
    }

    // Delivery Areas
    @GetMapping("/delivery-areas")
    @Operation(summary = "Get all delivery areas")
    public ResponseEntity<ApiResponse<List<DeliveryArea>>> getAllDeliveryAreas() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllDeliveryAreas()));
    }

    @PostMapping("/delivery-areas")
    @Operation(summary = "Create a delivery area")
    public ResponseEntity<ApiResponse<DeliveryArea>> createDeliveryArea(@Valid @RequestBody AdminDto.DeliveryAreaForm form) {
        return ResponseEntity.ok(ApiResponse.success("Delivery area created", adminService.createDeliveryArea(form)));
    }

    @DeleteMapping("/delivery-areas/{id}")
    @Operation(summary = "Delete a delivery area")
    public ResponseEntity<ApiResponse<String>> deleteDeliveryArea(@PathVariable Long id) {
        adminService.deleteDeliveryArea(id);
        return ResponseEntity.ok(ApiResponse.success("Delivery area deleted", null));
    }

    // Users
    @GetMapping("/users")
    @Operation(summary = "Get paginated users list")
    public ResponseEntity<ApiResponse<Page<AdminDto.UserListItem>>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getUsers(page, size)));
    }

    @PutMapping("/users/{id}/toggle-status")
    @Operation(summary = "Activate or deactivate a user account")
    public ResponseEntity<ApiResponse<String>> toggleUserStatus(@PathVariable Long id) {
        adminService.toggleUserActive(id);
        return ResponseEntity.ok(ApiResponse.success("User status updated", null));
    }

    // Image Upload
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload product or banner image")
    public ResponseEntity<ApiResponse<String>> uploadImage(@RequestParam("file") MultipartFile file) {
        String fileUrl = fileStorageService.storeFile(file);
        return ResponseEntity.ok(ApiResponse.success("Image uploaded successfully", fileUrl));
    }
}
