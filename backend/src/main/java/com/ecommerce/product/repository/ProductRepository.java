package com.ecommerce.product.repository;

import com.ecommerce.product.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findBySlugAndActiveTrue(String slug);
    Optional<Product> findBySlug(String slug);
    boolean existsBySlug(String slug);
    boolean existsBySku(String sku);

    List<Product> findTop10ByActiveTrueAndFeaturedTrueOrderByCreatedAtDesc();

    List<Product> findTop10ByActiveTrueOrderByStockQuantityDesc();

    @Query("SELECT p FROM Product p WHERE p.active = true " +
           "AND (:categoryId IS NULL OR p.category.id = :categoryId) " +
           "AND (:subcategoryId IS NULL OR p.subcategory.id = :subcategoryId) " +
           "AND (:brand IS NULL OR LOWER(p.brand) = LOWER(:brand)) " +
           "AND (:minPrice IS NULL OR p.price >= :minPrice) " +
           "AND (:maxPrice IS NULL OR p.price <= :maxPrice) " +
           "AND (:inStock IS NULL OR (:inStock = true AND p.stockQuantity > 0) OR (:inStock = false AND p.stockQuantity = 0))")
    Page<Product> filterProducts(
            @Param("categoryId") Long categoryId,
            @Param("subcategoryId") Long subcategoryId,
            @Param("brand") String brand,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("inStock") Boolean inStock,
            Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.active = true AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.brand) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.category.name) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Product> searchProducts(@Param("query") String query, Pageable pageable);

    @Query("SELECT DISTINCT p.brand FROM Product p WHERE p.active = true AND p.brand IS NOT NULL")
    List<String> findAllActiveBrands();

    long countByStockQuantityLessThan(int threshold);
}
