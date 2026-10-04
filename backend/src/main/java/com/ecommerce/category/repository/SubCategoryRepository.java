package com.ecommerce.category.repository;

import com.ecommerce.category.entity.SubCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubCategoryRepository extends JpaRepository<SubCategory, Long> {
    List<SubCategory> findByCategoryIdAndActiveTrueOrderByDisplayOrderAsc(Long categoryId);
    Optional<SubCategory> findBySlug(String slug);
    boolean existsBySlug(String slug);
}
