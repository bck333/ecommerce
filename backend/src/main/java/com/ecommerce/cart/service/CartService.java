package com.ecommerce.cart.service;

import com.ecommerce.cart.dto.CartDto;
import com.ecommerce.cart.entity.Cart;
import com.ecommerce.cart.entity.CartItem;
import com.ecommerce.cart.repository.CartItemRepository;
import com.ecommerce.cart.repository.CartRepository;
import com.ecommerce.common.exception.ApiException;
import com.ecommerce.common.exception.ResourceNotFoundException;
import com.ecommerce.product.entity.Product;
import com.ecommerce.product.repository.ProductRepository;
import com.ecommerce.user.entity.User;
import com.ecommerce.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public Cart getOrCreateCartEntity(Long userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
                    Cart cart = Cart.builder().user(user).build();
                    return cartRepository.save(cart);
                });
    }

    public CartDto.Response getCart(Long userId) {
        Cart cart = getOrCreateCartEntity(userId);
        return toCartResponse(cart);
    }

    @Transactional
    public CartDto.Response addItemToCart(Long userId, CartDto.AddItemRequest request) {
        Cart cart = getOrCreateCartEntity(userId);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        if (!product.isActive()) {
            throw new ApiException("This product is currently unavailable", HttpStatus.BAD_REQUEST, "PRODUCT_INACTIVE");
        }

        if (product.getStockQuantity() <= 0) {
            throw new ApiException("Product is out of stock", HttpStatus.BAD_REQUEST, "OUT_OF_STOCK");
        }

        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId())
                .orElse(null);

        if (item != null) {
            int newQty = item.getQuantity() + request.getQuantity();
            if (newQty > product.getStockQuantity()) {
                throw new ApiException(
                        String.format("Only %d item(s) available in stock", product.getStockQuantity()),
                        HttpStatus.BAD_REQUEST, "INSUFFICIENT_STOCK");
            }
            item.setQuantity(newQty);
            item.setPrice(product.getPrice()); // Always refresh with current DB price
            cartItemRepository.save(item);
        } else {
            if (request.getQuantity() > product.getStockQuantity()) {
                throw new ApiException(
                        String.format("Only %d item(s) available in stock", product.getStockQuantity()),
                        HttpStatus.BAD_REQUEST, "INSUFFICIENT_STOCK");
            }
            item = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .price(product.getPrice())
                    .build();
            cartItemRepository.save(item);
        }

        return getCart(userId);
    }

    @Transactional
    public CartDto.Response updateCartItem(Long userId, Long cartItemId, int newQuantity) {
        Cart cart = getOrCreateCartEntity(userId);

        CartItem item = cartItemRepository.findById(cartItemId)
                .filter(i -> i.getCart().getId().equals(cart.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", cartItemId));

        if (newQuantity <= 0) {
            cartItemRepository.delete(item);
        } else {
            Product product = item.getProduct();
            if (newQuantity > product.getStockQuantity()) {
                throw new ApiException(
                        String.format("Only %d item(s) available in stock", product.getStockQuantity()),
                        HttpStatus.BAD_REQUEST, "INSUFFICIENT_STOCK");
            }
            item.setQuantity(newQuantity);
            item.setPrice(product.getPrice());
            cartItemRepository.save(item);
        }

        return getCart(userId);
    }

    @Transactional
    public CartDto.Response removeCartItem(Long userId, Long cartItemId) {
        Cart cart = getOrCreateCartEntity(userId);

        CartItem item = cartItemRepository.findById(cartItemId)
                .filter(i -> i.getCart().getId().equals(cart.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", cartItemId));

        cartItemRepository.delete(item);
        return getCart(userId);
    }

    @Transactional
    public void clearCart(Long userId) {
        Cart cart = getOrCreateCartEntity(userId);
        cartItemRepository.deleteByCartId(cart.getId());
    }

    public CartDto.Response toCartResponse(Cart cart) {
        List<CartItem> items = cartItemRepository.findByCartId(cart.getId());

        List<CartDto.ItemResponse> itemResponses = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        int totalItems = 0;

        for (CartItem item : items) {
            Product p = item.getProduct();
            BigDecimal itemTotal = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            subtotal = subtotal.add(itemTotal);
            totalItems += item.getQuantity();

            itemResponses.add(CartDto.ItemResponse.builder()
                    .id(item.getId())
                    .productId(p.getId())
                    .productName(p.getName())
                    .productSlug(p.getSlug())
                    .brand(p.getBrand())
                    .unit(p.getUnit())
                    .quantityDescription(p.getQuantity())
                    .image(p.getImage())
                    .unitPrice(item.getPrice())
                    .mrp(p.getMrp())
                    .quantity(item.getQuantity())
                    .itemTotal(itemTotal)
                    .maxAvailableStock(p.getStockQuantity())
                    .build());
        }

        // Delivery fee rule: Free above ₹199, else ₹25
        BigDecimal deliveryFee = BigDecimal.ZERO;
        if (subtotal.compareTo(BigDecimal.ZERO) > 0) {
            deliveryFee = subtotal.compareTo(new BigDecimal("199.00")) >= 0 ? BigDecimal.ZERO : new BigDecimal("25.00");
        }

        BigDecimal totalAmount = subtotal.add(deliveryFee);

        return CartDto.Response.builder()
                .cartId(cart.getId())
                .items(itemResponses)
                .totalItems(totalItems)
                .subtotal(subtotal)
                .deliveryFee(deliveryFee)
                .discount(BigDecimal.ZERO)
                .totalAmount(totalAmount)
                .build();
    }
}
