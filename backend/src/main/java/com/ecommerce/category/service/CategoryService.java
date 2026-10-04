package com.ecommerce.category.service;

import com.ecommerce.category.dto.CategoryDto;
import com.ecommerce.category.dto.SubCategoryDto;
import com.ecommerce.category.entity.Category;
import com.ecommerce.category.entity.SubCategory;
import com.ecommerce.category.repository.CategoryRepository;
import com.ecommerce.category.repository.SubCategoryRepository;
import com.ecommerce.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final SubCategoryRepository subCategoryRepository;

    public List<CategoryDto> getAllActiveCategories() {
        return categoryRepository.findByActiveTrueOrderByDisplayOrderAsc()
                .stream()
                .map(this::toCategoryDto)
                .toList();
    }

    public CategoryDto getCategoryBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "slug", slug));
        return toCategoryDto(category);
    }

    public List<SubCategoryDto> getSubcategoriesByCategory(Long categoryId) {
        return subCategoryRepository.findByCategoryIdAndActiveTrueOrderByDisplayOrderAsc(categoryId)
                .stream()
                .map(this::toSubCategoryDto)
                .toList();
    }

    public CategoryDto toCategoryDto(Category category) {
        List<SubCategoryDto> subs = category.getSubcategories() == null ? List.of() :
                category.getSubcategories().stream()
                        .filter(SubCategory::isActive)
                        .map(this::toSubCategoryDto)
                        .toList();

        return CategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .image(category.getImage())
                .displayOrder(category.getDisplayOrder())
                .subcategories(subs)
                .build();
    }

    public SubCategoryDto toSubCategoryDto(SubCategory sub) {
        return SubCategoryDto.builder()
                .id(sub.getId())
                .categoryId(sub.getCategory().getId())
                .name(sub.getName())
                .slug(sub.getSlug())
                .image(sub.getImage())
                .displayOrder(sub.getDisplayOrder())
                .build();
    }
}
