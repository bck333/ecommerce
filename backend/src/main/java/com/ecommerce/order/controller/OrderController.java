package com.ecommerce.order.controller;

import com.ecommerce.common.response.ApiResponse;
import com.ecommerce.order.dto.CreateOrderRequest;
import com.ecommerce.order.dto.OrderDto;
import com.ecommerce.order.service.OrderService;
import com.ecommerce.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Place grocery orders, view history, track status and cancel")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @Operation(summary = "Place order from active cart")
    public ResponseEntity<ApiResponse<OrderDto>> createOrder(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody CreateOrderRequest request) {
        OrderDto order = orderService.createOrder(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Order placed successfully!", order));
    }

    @GetMapping
    @Operation(summary = "Get order history for customer")
    public ResponseEntity<ApiResponse<List<OrderDto>>> getOrders(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<OrderDto> orders = orderService.getUserOrders(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get single order details by ID")
    public ResponseEntity<ApiResponse<OrderDto>> getOrderById(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id) {
        OrderDto order = orderService.getOrderById(currentUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(order));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel an order if still in PLACED or CONFIRMED state")
    public ResponseEntity<ApiResponse<OrderDto>> cancelOrder(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id) {
        OrderDto order = orderService.cancelOrder(currentUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully", order));
    }
}
