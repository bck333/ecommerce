package com.ecommerce.order.service;

import com.ecommerce.cart.entity.Cart;
import com.ecommerce.cart.entity.CartItem;
import com.ecommerce.cart.repository.CartItemRepository;
import com.ecommerce.cart.service.CartService;
import com.ecommerce.common.exception.ApiException;
import com.ecommerce.common.exception.ResourceNotFoundException;
import com.ecommerce.coupon.dto.CouponDto;
import com.ecommerce.coupon.entity.Coupon;
import com.ecommerce.coupon.repository.CouponRepository;
import com.ecommerce.coupon.service.CouponService;
import com.ecommerce.delivery.entity.DeliveryArea;
import com.ecommerce.delivery.repository.DeliveryAreaRepository;
import com.ecommerce.order.dto.CreateOrderRequest;
import com.ecommerce.order.dto.OrderDto;
import com.ecommerce.order.entity.Order;
import com.ecommerce.order.entity.OrderItem;
import com.ecommerce.order.enums.OrderStatus;
import com.ecommerce.order.enums.PaymentMethod;
import com.ecommerce.order.enums.PaymentStatus;
import com.ecommerce.order.repository.OrderItemRepository;
import com.ecommerce.order.repository.OrderRepository;
import com.ecommerce.product.entity.Inventory;
import com.ecommerce.product.entity.Product;
import com.ecommerce.product.repository.InventoryRepository;
import com.ecommerce.product.repository.ProductRepository;
import com.ecommerce.user.entity.Address;
import com.ecommerce.user.entity.User;
import com.ecommerce.user.repository.AddressRepository;
import com.ecommerce.user.repository.UserRepository;
import com.ecommerce.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartService cartService;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final CouponService couponService;
    private final CouponRepository couponRepository;
    private final DeliveryAreaRepository deliveryAreaRepository;
    private final UserService userService;

    @Transactional
    public OrderDto createOrder(Long userId, CreateOrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // 1. Validate delivery address
        Address address = addressRepository.findByIdAndUserId(request.getAddressId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", request.getAddressId()));

        DeliveryArea deliveryArea = deliveryAreaRepository.findByPincode(address.getPincode())
                .orElse(null);

        if (deliveryArea != null && !deliveryArea.isDeliveryAvailable()) {
            throw new ApiException("Delivery is currently not available to pincode: " + address.getPincode(),
                    HttpStatus.BAD_REQUEST, "AREA_NOT_SERVICEABLE");
        }

        // 2. Load Cart
        Cart cart = cartService.getOrCreateCartEntity(userId);
        List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());

        if (cartItems == null || cartItems.isEmpty()) {
            throw new ApiException("Your cart is empty. Add products before placing an order.",
                    HttpStatus.BAD_REQUEST, "EMPTY_CART");
        }

        // 3. Validate products, inventory and calculate subtotal on server
        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> orderItemsToSave = new ArrayList<>();

        for (CartItem ci : cartItems) {
            Product product = productRepository.findById(ci.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", ci.getProduct().getId()));

            if (!product.isActive()) {
                throw new ApiException("Product '" + product.getName() + "' is no longer available.",
                        HttpStatus.BAD_REQUEST, "PRODUCT_UNAVAILABLE");
            }

            if (ci.getQuantity() > product.getStockQuantity()) {
                throw new ApiException(
                        String.format("Insufficient stock for '%s'. Available: %d, Requested: %d",
                                product.getName(), product.getStockQuantity(), ci.getQuantity()),
                        HttpStatus.BAD_REQUEST, "INSUFFICIENT_STOCK");
            }

            BigDecimal itemPrice = product.getPrice(); // server price
            BigDecimal itemTotal = itemPrice.multiply(BigDecimal.valueOf(ci.getQuantity()));
            subtotal = subtotal.add(itemTotal);

            // Deduct stock
            product.setStockQuantity(product.getStockQuantity() - ci.getQuantity());
            productRepository.save(product);

            // Deduct inventory
            Inventory inventory = inventoryRepository.findByProductId(product.getId()).orElse(null);
            if (inventory != null) {
                inventory.setAvailableQuantity(Math.max(0, inventory.getAvailableQuantity() - ci.getQuantity()));
                inventoryRepository.save(inventory);
            }

            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .productName(product.getName())
                    .price(itemPrice)
                    .quantity(ci.getQuantity())
                    .total(itemTotal)
                    .build();

            orderItemsToSave.add(orderItem);
        }

        // 4. Calculate Delivery Fee
        BigDecimal deliveryFee = BigDecimal.ZERO;
        if (deliveryArea != null) {
            deliveryFee = subtotal.compareTo(new BigDecimal("199.00")) >= 0 ? BigDecimal.ZERO : deliveryArea.getDeliveryFee();
        } else {
            deliveryFee = subtotal.compareTo(new BigDecimal("199.00")) >= 0 ? BigDecimal.ZERO : new BigDecimal("25.00");
        }

        // 5. Validate and apply coupon if provided
        BigDecimal discount = BigDecimal.ZERO;
        String appliedCouponCode = null;

        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            CouponDto.ValidationResult couponResult = couponService.validateCoupon(request.getCouponCode().trim(), subtotal);
            if (couponResult.isValid()) {
                discount = couponResult.getDiscountAmount();
                appliedCouponCode = couponResult.getCode();

                // Increment coupon times used
                Coupon coupon = couponRepository.findByCodeIgnoreCase(appliedCouponCode).orElse(null);
                if (coupon != null) {
                    coupon.setTimesUsed(coupon.getTimesUsed() + 1);
                    couponRepository.save(coupon);
                }
            } else {
                throw new ApiException("Coupon invalid: " + couponResult.getMessage(), HttpStatus.BAD_REQUEST, "INVALID_COUPON");
            }
        }

        BigDecimal totalAmount = subtotal.add(deliveryFee).subtract(discount);
        if (totalAmount.compareTo(BigDecimal.ZERO) < 0) {
            totalAmount = BigDecimal.ZERO;
        }

        // 6. Generate unique order number
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomSuffix = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        String orderNumber = "ORD-" + datePart + "-" + randomSuffix;

        // 7. Save Order
        Order order = Order.builder()
                .orderNumber(orderNumber)
                .user(user)
                .address(address)
                .subtotal(subtotal)
                .deliveryFee(deliveryFee)
                .discount(discount)
                .tax(BigDecimal.ZERO)
                .totalAmount(totalAmount)
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : PaymentMethod.CASH_ON_DELIVERY)
                .paymentStatus(PaymentStatus.PENDING)
                .orderStatus(OrderStatus.PLACED)
                .couponCode(appliedCouponCode)
                .build();

        order = orderRepository.save(order);

        // Save order items
        for (OrderItem item : orderItemsToSave) {
            item.setOrder(order);
            orderItemRepository.save(item);
        }

        // 8. Clear user cart
        cartItemRepository.deleteByCartId(cart.getId());

        order.setItems(orderItemsToSave);
        return toOrderDto(order);
    }

    public List<OrderDto> getUserOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toOrderDto)
                .toList();
    }

    public OrderDto getOrderById(Long userId, Long orderId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
        return toOrderDto(order);
    }

    @Transactional
    public OrderDto cancelOrder(Long userId, Long orderId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (order.getOrderStatus() != OrderStatus.PLACED && order.getOrderStatus() != OrderStatus.CONFIRMED) {
            throw new ApiException("Order cannot be cancelled in status: " + order.getOrderStatus(),
                    HttpStatus.BAD_REQUEST, "ORDER_NOT_CANCELLABLE");
        }

        order.setOrderStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);

        // Restore inventory and product stock
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                Product product = item.getProduct();
                product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
                productRepository.save(product);

                Inventory inventory = inventoryRepository.findByProductId(product.getId()).orElse(null);
                if (inventory != null) {
                    inventory.setAvailableQuantity(inventory.getAvailableQuantity() + item.getQuantity());
                    inventoryRepository.save(inventory);
                }
            }
        }

        return toOrderDto(order);
    }

    public OrderDto toOrderDto(Order order) {
        List<OrderDto.OrderItemDto> items = order.getItems() == null ? List.of() :
                order.getItems().stream().map(i -> OrderDto.OrderItemDto.builder()
                        .id(i.getId())
                        .productId(i.getProduct().getId())
                        .productName(i.getProductName())
                        .productImage(i.getProduct().getImage())
                        .price(i.getPrice())
                        .quantity(i.getQuantity())
                        .total(i.getTotal())
                        .build()).toList();

        return OrderDto.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .userId(order.getUser().getId())
                .customerName(order.getUser().getName())
                .customerMobile(order.getUser().getMobileNumber())
                .address(userService.toAddressDto(order.getAddress()))
                .subtotal(order.getSubtotal())
                .deliveryFee(order.getDeliveryFee())
                .discount(order.getDiscount())
                .tax(order.getTax())
                .totalAmount(order.getTotalAmount())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .orderStatus(order.getOrderStatus())
                .couponCode(order.getCouponCode())
                .items(items)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
