package com.ecommerce.product.service;

import com.ecommerce.common.exception.ResourceNotFoundException;
import com.ecommerce.product.dto.ProductDto;
import com.ecommerce.product.entity.Product;
import com.ecommerce.product.entity.ProductImage;
import com.ecommerce.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public Page<ProductDto> getFilteredProducts(
            Long categoryId,
            Long subcategoryId,
            String brand,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Boolean inStock,
            int page,
            int size,
            String sortBy,
            String sortDir) {

        Sort sort = Sort.by(Sort.Direction.fromString(sortDir.equalsIgnoreCase("desc") ? "DESC" : "ASC"), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        return productRepository.filterProducts(categoryId, subcategoryId, brand, minPrice, maxPrice, inStock, pageable)
                .map(this::toProductDto);
    }

    public Page<ProductDto> searchProducts(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "name"));
        return productRepository.searchProducts(query, pageable).map(this::toProductDto);
    }

    public ProductDto getProductBySlug(String slug) {
        Product product = productRepository.findBySlugAndActiveTrue(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "slug", slug));
        return toProductDto(product);
    }

    public ProductDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        return toProductDto(product);
    }

    public List<ProductDto> getFeaturedProducts() {
        return productRepository.findTop10ByActiveTrueAndFeaturedTrueOrderByCreatedAtDesc()
                .stream()
                .map(this::toProductDto)
                .toList();
    }

    public List<ProductDto> getPopularProducts() {
        return productRepository.findTop10ByActiveTrueOrderByStockQuantityDesc()
                .stream()
                .map(this::toProductDto)
                .toList();
    }

    public List<String> getAllBrands() {
        return productRepository.findAllActiveBrands();
    }

    public ProductDto toProductDto(Product product) {
        List<String> additionalImages = product.getImages() == null ? List.of() :
                product.getImages().stream().map(ProductImage::getImageUrl).toList();

        return ProductDto.builder()
                .id(product.getId())
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getName())
                .categorySlug(product.getCategory().getSlug())
                .subcategoryId(product.getSubcategory() != null ? product.getSubcategory().getId() : null)
                .subcategoryName(product.getSubcategory() != null ? product.getSubcategory().getName() : null)
                .name(product.getName())
                .slug(product.getSlug())
                .description(product.getDescription())
                .brand(product.getBrand())
                .sku(product.getSku())
                .price(product.getPrice())
                .mrp(product.getMrp())
                .discountPercentage(product.getDiscountPercentage())
                .unit(product.getUnit())
                .quantity(product.getQuantity())
                .stockQuantity(product.getStockQuantity())
                .inStock(product.getStockQuantity() > 0)
                .image(product.getImage())
                .featured(product.isFeatured())
                .additionalImages(additionalImages)
                .build();
    }
}
