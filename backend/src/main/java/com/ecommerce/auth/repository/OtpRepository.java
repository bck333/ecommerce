package com.ecommerce.auth.repository;

import com.ecommerce.auth.entity.Otp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpRepository extends JpaRepository<Otp, Long> {
    Optional<Otp> findTopByMobileNumberOrderByCreatedAtDesc(String mobileNumber);
}
