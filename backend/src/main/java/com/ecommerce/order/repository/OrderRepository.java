package com.ecommerce.order.repository;

import com.ecommerce.order.entity.Order;
import com.ecommerce.order.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Order> findByIdAndUserId(Long id, Long userId);

    Optional<Order> findByOrderNumber(String orderNumber);

    long countByOrderStatus(OrderStatus orderStatus);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt >= :startOfDay")
    long countTodayOrders(@Param("startOfDay") LocalDateTime startOfDay);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.paymentStatus = 'COMPLETED' AND o.createdAt >= :startOfDay")
    BigDecimal sumTodayRevenue(@Param("startOfDay") LocalDateTime startOfDay);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.paymentStatus = 'COMPLETED'")
    BigDecimal sumTotalRevenue();

    @Query("SELECT o FROM Order o WHERE (:status IS NULL OR o.orderStatus = :status) " +
           "AND (:query IS NULL OR o.orderNumber LIKE %:query% OR o.user.mobileNumber LIKE %:query% OR LOWER(o.user.name) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY o.createdAt DESC")
    Page<Order> searchAndFilterOrders(
            @Param("status") OrderStatus status,
            @Param("query") String query,
            Pageable pageable);
}
