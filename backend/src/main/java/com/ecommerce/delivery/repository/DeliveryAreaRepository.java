package com.ecommerce.delivery.repository;

import com.ecommerce.delivery.entity.DeliveryArea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DeliveryAreaRepository extends JpaRepository<DeliveryArea, Long> {
    Optional<DeliveryArea> findByPincode(String pincode);
    boolean existsByPincode(String pincode);
}
