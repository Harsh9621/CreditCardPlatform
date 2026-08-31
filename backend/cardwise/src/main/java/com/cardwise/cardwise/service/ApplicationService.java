package com.cardwise.cardwise.service;

import com.cardwise.cardwise.entity.Application;
import com.cardwise.cardwise.entity.CreditCard;
import com.cardwise.cardwise.entity.User;
import com.cardwise.cardwise.repository.ApplicationRepository;
import com.cardwise.cardwise.repository.CreditCardRepository;
import com.cardwise.cardwise.repository.UserRepository;

import org.springframework.stereotype.Service;

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

    public Application applyForCard(
            Long userId,
            Long creditCardId) {

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

            String latestStatus =
                    latestApplication.getStatus();


            // ---------------------------------------------
            // PENDING
            // ---------------------------------------------

            if ("PENDING".equalsIgnoreCase(
                    latestStatus)) {

                throw new IllegalStateException(
                        "You already have a pending application for this credit card."
                );
            }


            // ---------------------------------------------
            // APPROVED
            // ---------------------------------------------

            if ("APPROVED".equalsIgnoreCase(
                    latestStatus)) {

                throw new IllegalStateException(
                        "You already have an approved application for this credit card."
                );
            }


            // ---------------------------------------------
            // REJECTED
            // ---------------------------------------------

            if ("REJECTED".equalsIgnoreCase(
                    latestStatus)) {

                // User is allowed to apply again.
            }
        }


        // -------------------------------------------------
        // CREATE NEW APPLICATION
        // -------------------------------------------------

        Application application =
                new Application();

        application.setUser(user);

        application.setCreditCard(
                creditCard
        );

        application.setStatus(
                "PENDING"
        );

        application.setAppliedAt(
                LocalDateTime.now()
        );


        // -------------------------------------------------
        // SAVE APPLICATION
        // -------------------------------------------------

        return applicationRepository.save(
                application
        );
    }


    // =====================================================
    // GET ALL APPLICATIONS
    // =====================================================

    public List<Application>
    getAllApplications() {

        return applicationRepository
                .findAllByOrderByAppliedAtDesc();
    }


    // =====================================================
    // GET APPLICATION BY ID
    // =====================================================

    public Application
    getApplicationById(
            Long id) {

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

    public List<Application>
    getApplicationsByUser(
            Long userId) {

        return applicationRepository
                .findByUserIdOrderByAppliedAtDesc(
                        userId
                );
    }


    // =====================================================
    // GET APPLICATIONS BY CREDIT CARD
    // =====================================================

    public List<Application>
    getApplicationsByCard(
            Long creditCardId) {

        return applicationRepository
                .findByCreditCardIdOrderByAppliedAtDesc(
                        creditCardId
                );
    }


    // =====================================================
    // GET APPLICATIONS BY STATUS
    // =====================================================

    public List<Application>
    getApplicationsByStatus(
            String status) {

        return applicationRepository
                .findByStatusIgnoreCaseOrderByAppliedAtDesc(
                        status
                );
    }


    // =====================================================
    // APPROVE APPLICATION
    // =====================================================

    public Application
    approveApplication(
            Long id) {

        Application application =
                getApplicationById(id);

        String currentStatus =
                application.getStatus();


        // -------------------------------------------------
        // ALREADY APPROVED
        // -------------------------------------------------

        if ("APPROVED".equalsIgnoreCase(
                currentStatus)) {

            throw new IllegalStateException(
                    "Application is already approved."
            );
        }


        // -------------------------------------------------
        // REJECTED CANNOT BE APPROVED
        // -------------------------------------------------

        if ("REJECTED".equalsIgnoreCase(
                currentStatus)) {

            throw new IllegalStateException(
                    "A rejected application cannot be approved."
            );
        }


        // -------------------------------------------------
        // APPROVE
        // -------------------------------------------------

        application.setStatus(
                "APPROVED"
        );

        return applicationRepository.save(
                application
        );
    }


    // =====================================================
    // REJECT APPLICATION
    // =====================================================

    public Application
    rejectApplication(
            Long id) {

        Application application =
                getApplicationById(id);

        String currentStatus =
                application.getStatus();


        // -------------------------------------------------
        // ALREADY REJECTED
        // -------------------------------------------------

        if ("REJECTED".equalsIgnoreCase(
                currentStatus)) {

            throw new IllegalStateException(
                    "Application is already rejected."
            );
        }


        // -------------------------------------------------
        // APPROVED CANNOT BE REJECTED
        // -------------------------------------------------

        if ("APPROVED".equalsIgnoreCase(
                currentStatus)) {

            throw new IllegalStateException(
                    "An approved application cannot be rejected."
            );
        }


        // -------------------------------------------------
        // REJECT
        // -------------------------------------------------

        application.setStatus(
                "REJECTED"
        );

        return applicationRepository.save(
                application
        );
    }
}