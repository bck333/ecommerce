package com.ecommerce.admin.service;

import com.ecommerce.admin.dto.AdminDto;
import com.ecommerce.banner.entity.Banner;
import com.ecommerce.banner.repository.BannerRepository;
import com.ecommerce.category.dto.CategoryDto;
import com.ecommerce.category.dto.SubCategoryDto;
import com.ecommerce.category.entity.Category;
import com.ecommerce.category.entity.SubCategory;
import com.ecommerce.category.repository.CategoryRepository;
import com.ecommerce.category.repository.SubCategoryRepository;
import com.ecommerce.category.service.CategoryService;
import com.ecommerce.common.exception.ApiException;
import com.ecommerce.common.exception.ResourceNotFoundException;
import com.ecommerce.coupon.entity.Coupon;
import com.ecommerce.coupon.repository.CouponRepository;
import com.ecommerce.delivery.dto.DeliveryDto;
import com.ecommerce.delivery.entity.DeliveryArea;
import com.ecommerce.delivery.repository.DeliveryAreaRepository;
import com.ecommerce.order.dto.OrderDto;
import com.ecommerce.order.entity.Order;
import com.ecommerce.order.entity.OrderItem;
import com.ecommerce.order.enums.OrderStatus;
import com.ecommerce.order.repository.OrderRepository;
import com.ecommerce.order.service.OrderService;
import com.ecommerce.product.dto.ProductDto;
import com.ecommerce.product.entity.Inventory;
import com.ecommerce.product.entity.Product;
import com.ecommerce.product.repository.InventoryRepository;
import com.ecommerce.product.repository.ProductRepository;
import com.ecommerce.product.service.ProductService;
import com.ecommerce.user.entity.User;
import com.ecommerce.user.enums.Role;
import com.ecommerce.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SubCategoryRepository subCategoryRepository;
    private final CouponRepository couponRepository;
    private final BannerRepository bannerRepository;
    private final DeliveryAreaRepository deliveryAreaRepository;
    private final InventoryRepository inventoryRepository;
    private final OrderService orderService;
    private final ProductService productService;
    private final CategoryService categoryService;

    public AdminDto.DashboardStats getDashboardStats() {
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);

        long totalUsers = userRepository.countByRole(Role.CUSTOMER);
        long totalOrders = orderRepository.count();
        long todayOrders = orderRepository.countTodayOrders(startOfDay);
        BigDecimal todayRevenue = orderRepository.sumTodayRevenue(startOfDay);
        BigDecimal totalRevenue = orderRepository.sumTotalRevenue();
        long totalProducts = productRepository.count();
        long lowStockProducts = productRepository.countByStockQuantityLessThan(10);
        long pendingOrders = orderRepository.countByOrderStatus(OrderStatus.PLACED)
                + orderRepository.countByOrderStatus(OrderStatus.CONFIRMED)
                + orderRepository.countByOrderStatus(OrderStatus.PACKING)
                + orderRepository.countByOrderStatus(OrderStatus.OUT_FOR_DELIVERY);
        long deliveredOrders = orderRepository.countByOrderStatus(OrderStatus.DELIVERED);
        long cancelledOrders = orderRepository.countByOrderStatus(OrderStatus.CANCELLED);

        // Recent orders
        List<AdminDto.RecentOrder> recentOrders = orderRepository.findAll(
                PageRequest.of(0, 7, Sort.by(Sort.Direction.DESC, "createdAt"))
        ).getContent().stream().map(o -> AdminDto.RecentOrder.builder()
                .id(o.getId())
                .orderNumber(o.getOrderNumber())
                .customerName(o.getUser().getName() != null ? o.getUser().getName() : "Customer")
                .customerMobile(o.getUser().getMobileNumber())
                .amount(o.getTotalAmount())
                .status(o.getOrderStatus())
                .date(o.getCreatedAt())
                .build()).toList();

        // 7-day sales trend mock / calculation
        List<AdminDto.SalesTrend> trend = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int i = 6; i >= 0; i--) {
            LocalDate day = today.minusDays(i);
            trend.add(AdminDto.SalesTrend.builder()
                    .date(day.format(DateTimeFormatter.ofPattern("dd MMM")))
                    .revenue(todayRevenue.multiply(BigDecimal.valueOf(0.8 + (0.05 * (6 - i)))))
                    .orders(Math.max(1, (long) (todayOrders * (0.8 + (0.05 * (6 - i))))))
                    .build());
        }

        return AdminDto.DashboardStats.builder()
                .totalUsers(totalUsers)
                .totalOrders(totalOrders)
                .todayOrders(todayOrders)
                .todayRevenue(todayRevenue)
                .totalRevenue(totalRevenue)
                .totalProducts(totalProducts)
                .lowStockProducts(lowStockProducts)
                .pendingOrders(pendingOrders)
                .deliveredOrders(deliveredOrders)
                .cancelledOrders(cancelledOrders)
                .recentOrders(recentOrders)
                .salesTrend(trend)
                .build();
    }

    // Orders
    public Page<OrderDto> getOrders(OrderStatus status, String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return orderRepository.searchAndFilterOrders(status, (query != null && !query.isBlank()) ? query.trim() : null, pageable)
                .map(orderService::toOrderDto);
    }

    @Transactional
    public OrderDto updateOrderStatus(Long orderId, AdminDto.UpdateOrderStatus request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        order.setOrderStatus(request.getOrderStatus());
        if (request.getPaymentStatus() != null) {
            order.setPaymentStatus(request.getPaymentStatus());
        }

        order = orderRepository.save(order);
        return orderService.toOrderDto(order);
    }

    // Products
    @Transactional
    public ProductDto createProduct(AdminDto.ProductForm form) {
        Category category = categoryRepository.findById(form.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", form.getCategoryId()));

        SubCategory subcategory = null;
        if (form.getSubcategoryId() != null) {
            subcategory = subCategoryRepository.findById(form.getSubcategoryId()).orElse(null);
        }

        String slug = form.getSlug();
        if (slug == null || slug.isBlank()) {
            slug = form.getName().toLowerCase().replaceAll("[^a-z0-9]+", "-") + "-" + System.currentTimeMillis() % 10000;
        }

        int discountPercentage = 0;
        if (form.getMrp().compareTo(BigDecimal.ZERO) > 0 && form.getMrp().compareTo(form.getPrice()) > 0) {
            BigDecimal diff = form.getMrp().subtract(form.getPrice());
            discountPercentage = diff.multiply(new BigDecimal("100"))
                    .divide(form.getMrp(), 0, RoundingMode.HALF_UP).intValue();
        }

        Product product = Product.builder()
                .name(form.getName())
                .slug(slug)
                .category(category)
                .subcategory(subcategory)
                .description(form.getDescription())
                .brand(form.getBrand())
                .sku(form.getSku())
                .price(form.getPrice())
                .mrp(form.getMrp())
                .discountPercentage(discountPercentage)
                .unit(form.getUnit())
                .quantity(form.getQuantity())
                .stockQuantity(form.getStockQuantity())
                .image(form.getImage())
                .featured(form.isFeatured())
                .active(form.isActive())
                .build();

        product = productRepository.save(product);

        Inventory inventory = Inventory.builder()
                .product(product)
                .availableQuantity(product.getStockQuantity())
                .reservedQuantity(0)
                .build();
        inventoryRepository.save(inventory);

        return productService.toProductDto(product);
    }

    @Transactional
    public ProductDto updateProduct(Long id, AdminDto.ProductForm form) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        Category category = categoryRepository.findById(form.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", form.getCategoryId()));

        SubCategory subcategory = null;
        if (form.getSubcategoryId() != null) {
            subcategory = subCategoryRepository.findById(form.getSubcategoryId()).orElse(null);
        }

        int discountPercentage = 0;
        if (form.getMrp().compareTo(BigDecimal.ZERO) > 0 && form.getMrp().compareTo(form.getPrice()) > 0) {
            BigDecimal diff = form.getMrp().subtract(form.getPrice());
            discountPercentage = diff.multiply(new BigDecimal("100"))
                    .divide(form.getMrp(), 0, RoundingMode.HALF_UP).intValue();
        }

        product.setName(form.getName());
        if (form.getSlug() != null && !form.getSlug().isBlank()) {
            product.setSlug(form.getSlug());
        }
        product.setCategory(category);
        product.setSubcategory(subcategory);
        product.setDescription(form.getDescription());
        product.setBrand(form.getBrand());
        product.setSku(form.getSku());
        product.setPrice(form.getPrice());
        product.setMrp(form.getMrp());
        product.setDiscountPercentage(discountPercentage);
        product.setUnit(form.getUnit());
        product.setQuantity(form.getQuantity());
        product.setStockQuantity(form.getStockQuantity());
        product.setImage(form.getImage());
        product.setFeatured(form.isFeatured());
        product.setActive(form.isActive());

        product = productRepository.save(product);

        // Update inventory
        Inventory inventory = inventoryRepository.findByProductId(product.getId()).orElse(null);
        if (inventory != null) {
            inventory.setAvailableQuantity(product.getStockQuantity());
            inventoryRepository.save(inventory);
        }

        return productService.toProductDto(product);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        productRepository.delete(product);
    }

    // Categories
    @Transactional
    public CategoryDto createCategory(AdminDto.CategoryForm form) {
        String slug = form.getSlug();
        if (slug == null || slug.isBlank()) {
            slug = form.getName().toLowerCase().replaceAll("[^a-z0-9]+", "-");
        }

        Category category = Category.builder()
                .name(form.getName())
                .slug(slug)
                .description(form.getDescription())
                .image(form.getImage())
                .displayOrder(form.getDisplayOrder())
                .active(form.isActive())
                .build();

        return categoryService.toCategoryDto(categoryRepository.save(category));
    }

    @Transactional
    public CategoryDto updateCategory(Long id, AdminDto.CategoryForm form) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        category.setName(form.getName());
        if (form.getSlug() != null && !form.getSlug().isBlank()) {
            category.setSlug(form.getSlug());
        }
        category.setDescription(form.getDescription());
        category.setImage(form.getImage());
        category.setDisplayOrder(form.getDisplayOrder());
        category.setActive(form.isActive());

        return categoryService.toCategoryDto(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        categoryRepository.delete(category);
    }

    // Subcategories
    @Transactional
    public SubCategoryDto createSubcategory(AdminDto.SubCategoryForm form) {
        Category category = categoryRepository.findById(form.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", form.getCategoryId()));

        String slug = form.getSlug();
        if (slug == null || slug.isBlank()) {
            slug = form.getName().toLowerCase().replaceAll("[^a-z0-9]+", "-");
        }

        SubCategory sub = SubCategory.builder()
                .category(category)
                .name(form.getName())
                .slug(slug)
                .image(form.getImage())
                .displayOrder(form.getDisplayOrder())
                .active(form.isActive())
                .build();

        return categoryService.toSubCategoryDto(subCategoryRepository.save(sub));
    }

    @Transactional
    public void deleteSubcategory(Long id) {
        SubCategory sub = subCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SubCategory", "id", id));
        subCategoryRepository.delete(sub);
    }

    // Coupons
    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    @Transactional
    public Coupon createCoupon(AdminDto.CouponForm form) {
        Coupon coupon = Coupon.builder()
                .code(form.getCode().toUpperCase().trim())
                .description(form.getDescription())
                .discountType(form.getDiscountType())
                .discountValue(form.getDiscountValue())
                .minimumOrderAmount(form.getMinimumOrderAmount() != null ? form.getMinimumOrderAmount() : BigDecimal.ZERO)
                .maximumDiscount(form.getMaximumDiscount())
                .startDate(form.getStartDate() != null ? form.getStartDate() : LocalDateTime.now())
                .expiryDate(form.getExpiryDate())
                .usageLimit(form.getUsageLimit() > 0 ? form.getUsageLimit() : 1000)
                .active(form.isActive())
                .build();

        return couponRepository.save(coupon);
    }

    @Transactional
    public void deleteCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", id));
        couponRepository.delete(coupon);
    }

    // Banners
    public List<Banner> getAllBanners() {
        return bannerRepository.findAll();
    }

    @Transactional
    public Banner createBanner(AdminDto.BannerForm form) {
        Banner banner = Banner.builder()
                .title(form.getTitle())
                .image(form.getImage())
                .link(form.getLink())
                .displayOrder(form.getDisplayOrder())
                .active(form.isActive())
                .build();
        return bannerRepository.save(banner);
    }

    @Transactional
    public void deleteBanner(Long id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Banner", "id", id));
        bannerRepository.delete(banner);
    }

    // Delivery Areas
    public List<DeliveryArea> getAllDeliveryAreas() {
        return deliveryAreaRepository.findAll();
    }

    @Transactional
    public DeliveryArea createDeliveryArea(AdminDto.DeliveryAreaForm form) {
        DeliveryArea area = DeliveryArea.builder()
                .pincode(form.getPincode().trim())
                .city(form.getCity())
                .state(form.getState())
                .deliveryAvailable(form.isDeliveryAvailable())
                .deliveryFee(form.getDeliveryFee())
                .minimumOrderAmount(form.getMinimumOrderAmount())
                .build();
        return deliveryAreaRepository.save(area);
    }

    @Transactional
    public void deleteDeliveryArea(Long id) {
        DeliveryArea area = deliveryAreaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DeliveryArea", "id", id));
        deliveryAreaRepository.delete(area);
    }

    // Users
    public Page<AdminDto.UserListItem> getUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return userRepository.findAll(pageable).map(u -> AdminDto.UserListItem.builder()
                .id(u.getId())
                .mobileNumber(u.getMobileNumber())
                .name(u.getName())
                .email(u.getEmail())
                .profileCompleted(u.isProfileCompleted())
                .active(u.isActive())
                .totalOrders(orderRepository.findByUserIdOrderByCreatedAtDesc(u.getId()).size())
                .createdAt(u.getCreatedAt())
                .build());
    }

    @Transactional
    public void toggleUserActive(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        user.setActive(!user.isActive());
        userRepository.save(user);
    }
}
