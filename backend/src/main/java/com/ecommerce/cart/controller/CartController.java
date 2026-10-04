package com.ecommerce.cart.controller;

import com.ecommerce.cart.dto.CartDto;
import com.ecommerce.cart.service.CartService;
import com.ecommerce.common.response.ApiResponse;
import com.ecommerce.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Tag(name = "Cart", description = "Customer shopping cart and instant item management")
public class CartController {

    private final CartService cartService;

    @GetMapping
    @Operation(summary = "Get current customer's cart")
    public ResponseEntity<ApiResponse<CartDto.Response>> getCart(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        CartDto.Response cart = cartService.getCart(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(cart));
    }

    @PostMapping("/items")
    @Operation(summary = "Add an item to cart or increase quantity")
    public ResponseEntity<ApiResponse<CartDto.Response>> addItem(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody CartDto.AddItemRequest request) {
        CartDto.Response cart = cartService.addItemToCart(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Item added to cart", cart));
    }

    @PutMapping("/items/{id}")
    @Operation(summary = "Update quantity of a cart item (set 0 to remove)")
    public ResponseEntity<ApiResponse<CartDto.Response>> updateItem(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id,
            @Valid @RequestBody CartDto.UpdateItemRequest request) {
        CartDto.Response cart = cartService.updateCartItem(currentUser.getId(), id, request.getQuantity());
        return ResponseEntity.ok(ApiResponse.success("Cart updated", cart));
    }

    @DeleteMapping("/items/{id}")
    @Operation(summary = "Remove an item from cart")
    public ResponseEntity<ApiResponse<CartDto.Response>> removeItem(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id) {
        CartDto.Response cart = cartService.removeCartItem(currentUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Item removed from cart", cart));
    }

    @DeleteMapping
    @Operation(summary = "Clear all items from cart")
    public ResponseEntity<ApiResponse<String>> clearCart(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        cartService.clearCart(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Cart cleared", null));
    }
}
