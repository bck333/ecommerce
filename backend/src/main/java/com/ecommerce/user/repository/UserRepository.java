package com.ecommerce.user.repository;

import com.ecommerce.user.entity.User;
import com.ecommerce.user.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByMobileNumber(String mobileNumber);
    Optional<User> findByEmail(String email);
    boolean existsByMobileNumber(String mobileNumber);
    long countByRole(Role role);
}
