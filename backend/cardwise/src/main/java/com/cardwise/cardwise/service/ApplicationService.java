package com.cardwise.cardwise.service;

import com.cardwise.cardwise.entity.Application;
import com.cardwise.cardwise.entity.CreditCard;
import com.cardwise.cardwise.entity.User;
import com.cardwise.cardwise.entity.enums.ApplicationStatus;
import com.cardwise.cardwise.repository.ApplicationRepository;
import com.cardwise.cardwise.repository.CreditCardRepository;
import com.cardwise.cardwise.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final CreditCardRepository creditCardRepository;

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public ApplicationService(
            ApplicationRepository applicationRepository,
            UserRepository userRepository,
            CreditCardRepository creditCardRepository) {

        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
        this.creditCardRepository = creditCardRepository;
    }

    // =====================================================
    // APPLY FOR CREDIT CARD
    // =====================================================

    @Transactional
    public Application applyForCard(
            Long userId,
            Long creditCardId) {

        if (userId == null) {
            throw new IllegalArgumentException(
                    "User ID is required"
            );
        }

        if (creditCardId == null) {
            throw new IllegalArgumentException(
                    "Credit card ID is required"
            );
        }

        // -------------------------------------------------
        // FIND USER
        // -------------------------------------------------

        User user =
                userRepository
                        .findById(userId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                )
                        );

        // -------------------------------------------------
        // CHECK USER ACCOUNT
        // -------------------------------------------------

        if (!user.isActive()) {

            throw new IllegalStateException(
                    "Your account is inactive. You cannot apply for a credit card."
            );
        }

        // -------------------------------------------------
        // FIND CREDIT CARD
        // -------------------------------------------------

        CreditCard creditCard =
                creditCardRepository
                        .findById(creditCardId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Credit card not found"
                                )
                        );

        // -------------------------------------------------
        // FIND LATEST APPLICATION
        // -------------------------------------------------

        Application latestApplication =
                applicationRepository
                        .findFirstByUserIdAndCreditCardIdOrderByAppliedAtDesc(
                                userId,
                                creditCardId
                        );

        // -------------------------------------------------
        // CHECK LATEST APPLICATION
        // -------------------------------------------------

        if (latestApplication != null) {

            ApplicationStatus latestStatus =
                    latestApplication.getStatus();

            if (latestStatus == ApplicationStatus.PENDING) {

                throw new IllegalStateException(
                        "You already have a pending application for this credit card."
                );
            }

            if (latestStatus == ApplicationStatus.APPROVED) {

                throw new IllegalStateException(
                        "You already have an approved application for this credit card."
                );
            }

            /*
             * REJECTED:
             *
             * The user is allowed to submit a new application.
             */
        }

        // -------------------------------------------------
        // CREATE APPLICATION
        // -------------------------------------------------

        LocalDateTime now = LocalDateTime.now();

        Application application =
                new Application();

        application.setUser(user);

        application.setCreditCard(
                creditCard
        );

        application.setStatus(
                ApplicationStatus.PENDING
        );

        application.setAppliedAt(now);

        /*
         * Explicitly initialize audit fields as well.
         *
         * This works together with @PrePersist in Application.
         */
        application.setCreatedAt(now);
        application.setUpdatedAt(now);

        // -------------------------------------------------
        // SAVE
        // -------------------------------------------------

        return applicationRepository.save(
                application
        );
    }

    // =====================================================
    // GET ALL APPLICATIONS
    // =====================================================

    @Transactional(readOnly = true)
    public List<Application> getAllApplications() {

        return applicationRepository
                .findAllByOrderByAppliedAtDesc();
    }

    // =====================================================
    // GET APPLICATION BY ID
    // =====================================================

    @Transactional(readOnly = true)
    public Application getApplicationById(
            Long id) {

        if (id == null) {

            throw new RuntimeException(
                    "Application ID is required"
            );
        }

        return applicationRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Application not found"
                        )
                );
    }

    // =====================================================
    // GET USER APPLICATIONS
    // =====================================================

    @Transactional(readOnly = true)
    public List<Application> getApplicationsByUser(
            Long userId) {

        if (userId == null) {

            throw new IllegalArgumentException(
                    "User ID is required"
            );
        }

        return applicationRepository
                .findByUserIdOrderByAppliedAtDesc(
                        userId
                );
    }

    // =====================================================
    // GET APPLICATIONS BY CREDIT CARD
    // =====================================================

    @Transactional(readOnly = true)
    public List<Application> getApplicationsByCard(
            Long creditCardId) {

        if (creditCardId == null) {

            throw new IllegalArgumentException(
                    "Credit card ID is required"
            );
        }

        return applicationRepository
                .findByCreditCardIdOrderByAppliedAtDesc(
                        creditCardId
                );
    }

    // =====================================================
    // GET APPLICATIONS BY STATUS
    // =====================================================

    @Transactional(readOnly = true)
    public List<Application> getApplicationsByStatus(
            String status) {

        if (status == null ||
                status.isBlank()) {

            throw new IllegalArgumentException(
                    "Application status is required"
            );
        }

        ApplicationStatus applicationStatus;

        try {

            applicationStatus =
                    ApplicationStatus.valueOf(
                            status.trim().toUpperCase()
                    );

        } catch (IllegalArgumentException ex) {

            throw new IllegalArgumentException(
                    "Invalid application status: " +
                            status
            );
        }

        return applicationRepository
                .findByStatusOrderByAppliedAtDesc(
                        applicationStatus
                );
    }

    // =====================================================
    // APPROVE APPLICATION
    // =====================================================

    @Transactional
    public Application approveApplication(
            Long id) {

        if (id == null) {

            throw new IllegalArgumentException(
                    "Application ID is required"
            );
        }

        Application application =
                getApplicationById(id);

        ApplicationStatus currentStatus =
                application.getStatus();

        // -------------------------------------------------
        // ALREADY APPROVED
        // -------------------------------------------------

        if (currentStatus == ApplicationStatus.APPROVED) {

            throw new IllegalStateException(
                    "Application is already approved."
            );
        }

        // -------------------------------------------------
        // REJECTED CANNOT BE APPROVED
        // -------------------------------------------------

        if (currentStatus == ApplicationStatus.REJECTED) {

            throw new IllegalStateException(
                    "A rejected application cannot be approved."
            );
        }

        // -------------------------------------------------
        // APPROVE
        // -------------------------------------------------

        application.setStatus(
                ApplicationStatus.APPROVED
        );

        application.setReviewedAt(
                LocalDateTime.now()
        );

        /*
         * reviewedBy is intentionally not set here because
         * this method currently receives only the application ID.
         *
         * We can add the authenticated admin later without
         * breaking the current endpoint.
         */

        // -------------------------------------------------
        // SAVE
        // -------------------------------------------------

        return applicationRepository.save(
                application
        );
    }

    // =====================================================
    // REJECT APPLICATION
    // =====================================================

    @Transactional
    public Application rejectApplication(
            Long id) {

        if (id == null) {

            throw new IllegalArgumentException(
                    "Application ID is required"
            );
        }

        Application application =
                getApplicationById(id);

        ApplicationStatus currentStatus =
                application.getStatus();

        // -------------------------------------------------
        // ALREADY REJECTED
        // -------------------------------------------------

        if (currentStatus == ApplicationStatus.REJECTED) {

            throw new IllegalStateException(
                    "Application is already rejected."
            );
        }

        // -------------------------------------------------
        // APPROVED CANNOT BE REJECTED
        // -------------------------------------------------

        if (currentStatus == ApplicationStatus.APPROVED) {

            throw new IllegalStateException(
                    "An approved application cannot be rejected."
            );
        }

        // -------------------------------------------------
        // REJECT
        // -------------------------------------------------

        application.setStatus(
                ApplicationStatus.REJECTED
        );

        application.setReviewedAt(
                LocalDateTime.now()
        );

        /*
         * reviewedBy will be populated later when the
         * authenticated admin is passed into the service.
         */

        // -------------------------------------------------
        // SAVE
        // -------------------------------------------------

        return applicationRepository.save(
                application
        );
    }
}