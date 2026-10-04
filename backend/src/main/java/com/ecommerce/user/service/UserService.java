package com.ecommerce.user.service;

import com.ecommerce.auth.dto.AuthResponse;
import com.ecommerce.common.exception.ResourceNotFoundException;
import com.ecommerce.user.dto.AddressDto;
import com.ecommerce.user.dto.CreateAddressRequest;
import com.ecommerce.user.dto.UpdateProfileRequest;
import com.ecommerce.user.entity.Address;
import com.ecommerce.user.entity.User;
import com.ecommerce.user.repository.AddressRepository;
import com.ecommerce.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;

    public AuthResponse.UserSummary getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        return toUserSummary(user);
    }

    @Transactional
    public AuthResponse.UserSummary updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.setName(request.getName());
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            user.setEmail(request.getEmail());
        }
        user.setProfileCompleted(true);

        user = userRepository.save(user);
        return toUserSummary(user);
    }

    public List<AddressDto> getUserAddresses(Long userId) {
        return addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId)
                .stream()
                .map(this::toAddressDto)
                .toList();
    }

    @Transactional
    public AddressDto addAddress(Long userId, CreateAddressRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // If this is set as default, reset other addresses default flag
        if (request.isDefault()) {
            List<Address> addresses = addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId);
            for (Address a : addresses) {
                if (a.isDefault()) {
                    a.setDefault(false);
                    addressRepository.save(a);
                }
            }
        }

        Address address = Address.builder()
                .user(user)
                .addressLine1(request.getAddressLine1())
                .addressLine2(request.getAddressLine2())
                .landmark(request.getLandmark())
                .city(request.getCity())
                .state(request.getState())
                .pincode(request.getPincode())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .addressType(request.getAddressType())
                .isDefault(request.isDefault())
                .build();

        address = addressRepository.save(address);
        return toAddressDto(address);
    }

    @Transactional
    public AddressDto updateAddress(Long userId, Long addressId, CreateAddressRequest request) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", addressId));

        if (request.isDefault() && !address.isDefault()) {
            List<Address> addresses = addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId);
            for (Address a : addresses) {
                if (a.isDefault()) {
                    a.setDefault(false);
                    addressRepository.save(a);
                }
            }
        }

        address.setAddressLine1(request.getAddressLine1());
        address.setAddressLine2(request.getAddressLine2());
        address.setLandmark(request.getLandmark());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setPincode(request.getPincode());
        address.setLatitude(request.getLatitude());
        address.setLongitude(request.getLongitude());
        address.setAddressType(request.getAddressType());
        address.setDefault(request.isDefault());

        address = addressRepository.save(address);
        return toAddressDto(address);
    }

    @Transactional
    public void deleteAddress(Long userId, Long addressId) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", addressId));

        addressRepository.delete(address);
    }

    private AuthResponse.UserSummary toUserSummary(User user) {
        return AuthResponse.UserSummary.builder()
                .id(user.getId())
                .mobileNumber(user.getMobileNumber())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .profileCompleted(user.isProfileCompleted())
                .build();
    }

    public AddressDto toAddressDto(Address address) {
        return AddressDto.builder()
                .id(address.getId())
                .addressLine1(address.getAddressLine1())
                .addressLine2(address.getAddressLine2())
                .landmark(address.getLandmark())
                .city(address.getCity())
                .state(address.getState())
                .pincode(address.getPincode())
                .latitude(address.getLatitude())
                .longitude(address.getLongitude())
                .addressType(address.getAddressType())
                .isDefault(address.isDefault())
                .build();
    }
}
