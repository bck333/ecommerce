package com.ecommerce.delivery.service;

import com.ecommerce.delivery.dto.DeliveryDto;
import com.ecommerce.delivery.entity.DeliveryArea;
import com.ecommerce.delivery.repository.DeliveryAreaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DeliveryService {

    private final DeliveryAreaRepository deliveryAreaRepository;

    public DeliveryDto.Response checkPincode(String pincode) {
        Optional<DeliveryArea> areaOpt = deliveryAreaRepository.findByPincode(pincode);

        if (areaOpt.isPresent() && areaOpt.get().isDeliveryAvailable()) {
            DeliveryArea area = areaOpt.get();
            return DeliveryDto.Response.builder()
                    .serviceable(true)
                    .pincode(pincode)
                    .city(area.getCity())
                    .state(area.getState())
                    .deliveryFee(area.getDeliveryFee())
                    .minimumOrderAmount(area.getMinimumOrderAmount())
                    .estimatedDeliveryTime("10 - 15 minutes")
                    .message("Delivery available in " + area.getCity())
                    .build();
        }

        return DeliveryDto.Response.builder()
                .serviceable(false)
                .pincode(pincode)
                .deliveryFee(BigDecimal.ZERO)
                .minimumOrderAmount(BigDecimal.ZERO)
                .estimatedDeliveryTime(null)
                .message("Currently we do not deliver to pincode " + pincode + ". We are expanding rapidly!")
                .build();
    }

    public List<DeliveryDto.AreaDto> getAllPincodes() {
        return deliveryAreaRepository.findAll().stream().map(area -> DeliveryDto.AreaDto.builder()
                .id(area.getId())
                .pincode(area.getPincode())
                .city(area.getCity())
                .state(area.getState())
                .deliveryAvailable(area.isDeliveryAvailable())
                .deliveryFee(area.getDeliveryFee())
                .minimumOrderAmount(area.getMinimumOrderAmount())
                .build()).toList();
    }
}
