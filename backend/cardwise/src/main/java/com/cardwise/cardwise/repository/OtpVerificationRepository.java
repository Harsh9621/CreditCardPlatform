package com.cardwise.cardwise.repository;

import com.cardwise.cardwise.entity.OtpVerification;
import com.cardwise.cardwise.entity.enums.OtpPurpose;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OtpVerificationRepository
        extends JpaRepository<OtpVerification, Long> {

    // =====================================================
    // FIND LATEST ACTIVE OTP
    // =====================================================

    Optional<OtpVerification>
    findTopByIdentifierAndPurposeAndVerifiedFalseOrderByCreatedAtDesc(
            String identifier,
            OtpPurpose purpose
    );

    // =====================================================
    // FIND ALL ACTIVE OTPS
    // =====================================================

    List<OtpVerification>
    findByIdentifierAndPurposeAndVerifiedFalse(
            String identifier,
            OtpPurpose purpose
    );
}