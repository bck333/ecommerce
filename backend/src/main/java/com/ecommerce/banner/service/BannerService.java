package com.ecommerce.banner.service;

import com.ecommerce.banner.dto.BannerDto;
import com.ecommerce.banner.repository.BannerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BannerService {

    private final BannerRepository bannerRepository;

    public List<BannerDto> getActiveBanners() {
        return bannerRepository.findByActiveTrueOrderByDisplayOrderAsc()
                .stream()
                .map(b -> BannerDto.builder()
                        .id(b.getId())
                        .title(b.getTitle())
                        .image(b.getImage())
                        .link(b.getLink())
                        .displayOrder(b.getDisplayOrder())
                        .build())
                .toList();
    }
}
