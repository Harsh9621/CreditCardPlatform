package com.cardwise.cardwise.service;

import com.cardwise.cardwise.entity.OtpVerification;
import com.cardwise.cardwise.entity.enums.OtpChannel;
import com.cardwise.cardwise.entity.enums.OtpPurpose;
import com.cardwise.cardwise.repository.OtpVerificationRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class OtpService {

    private static final int OTP_EXPIRY_MINUTES = 5;
    private static final int MAX_ATTEMPTS = 5;

    private final OtpVerificationRepository otpRepository;
    private final PasswordEncoder passwordEncoder;

    private final SecureRandom secureRandom = new SecureRandom();

    public OtpService(
            OtpVerificationRepository otpRepository,
            PasswordEncoder passwordEncoder) {

        this.otpRepository = otpRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Generate and store OTP.
     *
     * IMPORTANT:
     * The OTP is hashed before being stored in the database.
     *
     * During local development, the OTP is printed in the
     * Spring Boot console so that the password reset flow
     * can be tested without an SMS provider.
     */
    public String generateAndStoreOtp(
            String phone,
            String channel,
            String purpose) {

        String normalizedPhone = normalizePhone(phone);

        // Validate phone number
        if (normalizedPhone == null ||
                normalizedPhone.length() != 10) {

            throw new IllegalArgumentException(
                    "Enter a valid 10-digit mobile number"
            );
        }

        // Parse channel and purpose
        OtpChannel otpChannel = parseChannel(channel);
        OtpPurpose otpPurpose = parsePurpose(purpose);

        // Invalidate all previous unused OTPs
        List<OtpVerification> previousOtps =
                otpRepository
                        .findByIdentifierAndPurposeAndVerifiedFalse(
                                normalizedPhone,
                                otpPurpose
                        );

        if (!previousOtps.isEmpty()) {

            for (OtpVerification previousOtp : previousOtps) {
                previousOtp.setVerified(true);
            }

            otpRepository.saveAll(previousOtps);
        }

        // Generate new six-digit OTP
        String otp = generateSixDigitOtp();

        // Never store the plain OTP in the database
        String otpHash =
                passwordEncoder.encode(otp);

        LocalDateTime now =
                LocalDateTime.now();

        // Create OTP verification record
        OtpVerification verification =
                new OtpVerification();

        verification.setIdentifier(normalizedPhone);

        verification.setChannel(
                otpChannel
        );

        verification.setPurpose(
                otpPurpose
        );

        verification.setOtpHash(
                otpHash
        );

        verification.setCreatedAt(
                now
        );

        verification.setExpiresAt(
                now.plusMinutes(OTP_EXPIRY_MINUTES)
        );

        verification.setAttempts(0);

        verification.setMaxAttempts(
                MAX_ATTEMPTS
        );

        verification.setVerified(false);

        // Save OTP record
        otpRepository.save(verification);

        /*
         * =====================================================
         * DEVELOPMENT ONLY
         * =====================================================
         *
         * There is currently no SMS provider connected.
         * Therefore, print the OTP to the Spring Boot console.
         *
         * REMOVE THIS BLOCK BEFORE PRODUCTION DEPLOYMENT.
         */

        System.out.println();
        System.out.println("========================================");
        System.out.println("       CARDWISE DEVELOPMENT OTP");
        System.out.println("========================================");
        System.out.println("OTP       : " + otp);
        System.out.println("Phone     : " + normalizedPhone);
        System.out.println("Purpose   : " + otpPurpose);
        System.out.println("Expires   : " +
                OTP_EXPIRY_MINUTES + " minutes");
        System.out.println("========================================");
        System.out.println();

        return otp;
    }


    /**
     * Verify OTP entered by the user.
     */
    public boolean verifyOtp(
            String phone,
            String purpose,
            String otp) {

        // Normalize phone
        String normalizedPhone =
                normalizePhone(phone);

        if (normalizedPhone == null ||
                normalizedPhone.length() != 10) {

            return false;
        }

        // Validate OTP input
        if (otp == null ||
                otp.isBlank()) {

            return false;
        }

        // Parse purpose
        OtpPurpose otpPurpose;

        try {

            otpPurpose =
                    parsePurpose(purpose);

        } catch (IllegalArgumentException exception) {

            return false;
        }

        // Remove accidental spaces
        String normalizedOtp =
                otp.trim();

        // OTP must contain exactly 6 digits
        if (!normalizedOtp.matches("\\d{6}")) {

            return false;
        }

        /*
         * Find the latest unverified OTP for this
         * phone number and purpose.
         */
        OtpVerification verification =
                otpRepository
                        .findTopByIdentifierAndPurposeAndVerifiedFalseOrderByCreatedAtDesc(
                                normalizedPhone,
                                otpPurpose
                        )
                        .orElse(null);

        if (verification == null) {

            return false;
        }

        // Check expiration
        if (verification.getExpiresAt() == null ||
                LocalDateTime.now().isAfter(
                        verification.getExpiresAt()
                )) {

            return false;
        }

        // Check maximum attempts
        if (verification.getAttempts() >=
                verification.getMaxAttempts()) {

            return false;
        }

        // Increase attempt count
        verification.setAttempts(
                verification.getAttempts() + 1
        );

        /*
         * Compare entered OTP with the BCrypt hash
         * stored in the database.
         */
        boolean matches =
                passwordEncoder.matches(
                        normalizedOtp,
                        verification.getOtpHash()
                );

        // Wrong OTP
        if (!matches) {

            otpRepository.save(
                    verification
            );

            return false;
        }

        // Correct OTP
        verification.setVerified(true);

        otpRepository.save(
                verification
        );

        return true;
    }


    /**
     * Parse OTP channel.
     */
    private OtpChannel parseChannel(
            String channel) {

        if (channel == null ||
                channel.isBlank()) {

            return OtpChannel.PHONE;
        }

        try {

            return OtpChannel.valueOf(
                    channel.trim().toUpperCase()
            );

        } catch (IllegalArgumentException exception) {

            throw new IllegalArgumentException(
                    "Unsupported OTP channel."
            );
        }
    }


    /**
     * Parse OTP purpose.
     */
    private OtpPurpose parsePurpose(
            String purpose) {

        if (purpose == null ||
                purpose.isBlank()) {

            return OtpPurpose.PASSWORD_RESET;
        }

        try {

            return OtpPurpose.valueOf(
                    purpose.trim().toUpperCase()
            );

        } catch (IllegalArgumentException exception) {

            throw new IllegalArgumentException(
                    "Unsupported OTP purpose."
            );
        }
    }


    /**
     * Generate a secure six-digit OTP.
     */
    private String generateSixDigitOtp() {

        int number =
                secureRandom.nextInt(900000) + 100000;

        return String.valueOf(number);
    }


    /**
     * Normalize Indian phone numbers.
     *
     * Supported:
     *
     * 9621301174
     * 09621301174
     * 919621301174
     */
    private String normalizePhone(
            String phone) {

        if (phone == null) {

            return null;
        }

        // Keep digits only
        String digits =
                phone.replaceAll("[^0-9]", "");

        // Normal 10-digit number
        if (digits.length() == 10) {

            return digits;
        }

        // 91 + 10 digits
        if (digits.length() == 12 &&
                digits.startsWith("91")) {

            return digits.substring(2);
        }

        // 0 + 10 digits
        if (digits.length() == 11 &&
                digits.startsWith("0")) {

            return digits.substring(1);
        }

        return digits;
    }
}