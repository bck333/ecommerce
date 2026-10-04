package com.ecommerce.auth.service;

import com.ecommerce.auth.entity.Otp;
import com.ecommerce.auth.repository.OtpRepository;
import com.ecommerce.common.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);
    private static final SecureRandom random = new SecureRandom();

    private final OtpRepository otpRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.otp.expiry-minutes:5}")
    private int expiryMinutes;

    @Value("${app.otp.resend-cooldown-seconds:30}")
    private int resendCooldownSeconds;

    @Value("${app.otp.max-attempts:5}")
    private int maxAttempts;

    @Value("${app.otp.dev-mode:true}")
    private boolean devMode;

    @Value("${app.otp.dev-code:123456}")
    private String devCode;

    @Transactional
    public void generateAndSendOtp(String mobileNumber) {
        // Check cooldown
        Optional<Otp> existingOtp = otpRepository.findTopByMobileNumberOrderByCreatedAtDesc(mobileNumber);
        if (existingOtp.isPresent()) {
            Otp lastOtp = existingOtp.get();
            long secondsSinceLast = ChronoUnit.SECONDS.between(lastOtp.getCreatedAt(), LocalDateTime.now());
            if (secondsSinceLast < resendCooldownSeconds) {
                long waitTime = resendCooldownSeconds - secondsSinceLast;
                throw new ApiException(
                        String.format("Please wait %d seconds before requesting another OTP.", waitTime),
                        HttpStatus.TOO_MANY_REQUESTS, "OTP_COOLDOWN");
            }
        }

        // Generate OTP
        String otpCode;
        if (devMode) {
            otpCode = devCode;
            log.info(">>> [DEV MODE] Generated OTP for mobile {}: {} <<<", mobileNumber, otpCode);
        } else {
            int code = 100000 + random.nextInt(900000);
            otpCode = String.valueOf(code);
            // Send SMS through configured SMS provider (e.g. Twilio, MSG91, Fast2SMS)
            log.info("Sending SMS OTP to mobile {}", mobileNumber);
        }

        // Hash OTP before storing
        String hashedOtp = passwordEncoder.encode(otpCode);

        Otp otp = Otp.builder()
                .mobileNumber(mobileNumber)
                .otpHash(hashedOtp)
                .expiresAt(LocalDateTime.now().plusMinutes(expiryMinutes))
                .attempts(0)
                .verified(false)
                .build();

        otpRepository.save(otp);
    }

    @Transactional
    public void verifyOtp(String mobileNumber, String rawOtp) {
        Otp otp = otpRepository.findTopByMobileNumberOrderByCreatedAtDesc(mobileNumber)
                .orElseThrow(() -> new ApiException("No OTP found for this mobile number. Please request a new one.",
                        HttpStatus.BAD_REQUEST, "OTP_NOT_FOUND"));

        if (otp.isVerified()) {
            throw new ApiException("This OTP has already been used. Please request a new one.",
                    HttpStatus.BAD_REQUEST, "OTP_ALREADY_USED");
        }

        if (LocalDateTime.now().isAfter(otp.getExpiresAt())) {
            throw new ApiException("OTP has expired. Please request a new one.",
                    HttpStatus.BAD_REQUEST, "OTP_EXPIRED");
        }

        if (otp.getAttempts() >= maxAttempts) {
            throw new ApiException("Maximum OTP verification attempts exceeded. Please request a new one.",
                    HttpStatus.BAD_REQUEST, "OTP_MAX_ATTEMPTS_EXCEEDED");
        }

        otp.setAttempts(otp.getAttempts() + 1);

        // In dev mode, allow devCode directly or check hashed OTP
        boolean matches = passwordEncoder.matches(rawOtp, otp.getOtpHash()) || (devMode && devCode.equals(rawOtp));

        if (!matches) {
            otpRepository.save(otp);
            int remaining = maxAttempts - otp.getAttempts();
            throw new ApiException(
                    String.format("Invalid OTP. %d attempt(s) remaining.", remaining),
                    HttpStatus.BAD_REQUEST, "INVALID_OTP");
        }

        // Mark OTP as verified and used
        otp.setVerified(true);
        otpRepository.save(otp);
    }
}
