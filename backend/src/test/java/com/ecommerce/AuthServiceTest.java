package com.ecommerce;

import com.ecommerce.auth.dto.AuthResponse;
import com.ecommerce.auth.dto.VerifyOtpRequest;
import com.ecommerce.auth.service.AuthService;
import com.ecommerce.auth.service.OtpService;
import com.ecommerce.cart.entity.Cart;
import com.ecommerce.cart.repository.CartRepository;
import com.ecommerce.security.JwtTokenProvider;
import com.ecommerce.user.entity.User;
import com.ecommerce.user.enums.Role;
import com.ecommerce.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private OtpService otpService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CartRepository cartRepository;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    private final String testMobile = "9876543210";
    private final String testOtp = "123456";

    @BeforeEach
    void setUp() {
        // Common setup
    }

    @Test
    @DisplayName("New User: Mobile does not exist -> Verify OTP -> Creates user, newUser=true, JWT generated")
    void testVerifyOtp_NewUser_CreatesCustomer() {
        // Arrange
        VerifyOtpRequest request = new VerifyOtpRequest(testMobile, testOtp);

        doNothing().when(otpService).verifyOtp(testMobile, testOtp);
        when(userRepository.findByMobileNumber(testMobile)).thenReturn(Optional.empty());

        User savedUser = User.builder()
                .id(101L)
                .mobileNumber(testMobile)
                .role(Role.CUSTOMER)
                .profileCompleted(false)
                .active(true)
                .build();

        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(cartRepository.save(any(Cart.class))).thenReturn(new Cart());
        when(tokenProvider.generateToken(eq(101L), eq(testMobile), eq(Role.CUSTOMER))).thenReturn("mock-jwt-token-101");

        // Act
        AuthResponse response = authService.verifyOtp(request);

        // Assert
        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertTrue(response.isNewUser(), "Should be identified as new user");
        assertEquals("mock-jwt-token-101", response.getToken());
        assertNotNull(response.getUser());
        assertEquals(101L, response.getUser().getId());
        assertEquals(testMobile, response.getUser().getMobileNumber());
        assertFalse(response.getUser().isProfileCompleted());

        verify(userRepository, times(1)).save(any(User.class));
        verify(cartRepository, times(1)).save(any(Cart.class));
    }

    @Test
    @DisplayName("Existing User: Mobile exists -> Verify OTP -> Logins user, newUser=false, no duplicate created")
    void testVerifyOtp_ExistingUser_LoginsCustomer() {
        // Arrange
        VerifyOtpRequest request = new VerifyOtpRequest(testMobile, testOtp);

        doNothing().when(otpService).verifyOtp(testMobile, testOtp);

        User existingUser = User.builder()
                .id(55L)
                .mobileNumber(testMobile)
                .name("Kiran Kumar")
                .role(Role.CUSTOMER)
                .profileCompleted(true)
                .active(true)
                .build();

        when(userRepository.findByMobileNumber(testMobile)).thenReturn(Optional.of(existingUser));
        when(tokenProvider.generateToken(eq(55L), eq(testMobile), eq(Role.CUSTOMER))).thenReturn("mock-jwt-token-55");

        // Act
        AuthResponse response = authService.verifyOtp(request);

        // Assert
        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertFalse(response.isNewUser(), "Should be identified as existing user");
        assertEquals("mock-jwt-token-55", response.getToken());
        assertEquals("Login successful", response.getMessage());
        assertNotNull(response.getUser());
        assertEquals(55L, response.getUser().getId());
        assertEquals("Kiran Kumar", response.getUser().getName());
        assertTrue(response.getUser().isProfileCompleted());

        // Verify no new user or cart is saved
        verify(userRepository, never()).save(any(User.class));
        verify(cartRepository, never()).save(any(Cart.class));
    }
}
