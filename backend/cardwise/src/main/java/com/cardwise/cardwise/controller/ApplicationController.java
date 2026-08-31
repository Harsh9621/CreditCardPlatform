package com.cardwise.cardwise.controller;

import com.cardwise.cardwise.entity.Application;
import com.cardwise.cardwise.entity.User;
import com.cardwise.cardwise.service.ApplicationService;
import com.cardwise.cardwise.service.UserService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "http://localhost:5173")
public class ApplicationController {

    private final ApplicationService applicationService;
    private final UserService userService;

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public ApplicationController(
            ApplicationService applicationService,
            UserService userService) {

        this.applicationService = applicationService;
        this.userService = userService;
    }

    // =====================================================
    // APPLY FOR CREDIT CARD
    // =====================================================

    @PostMapping("/apply")
    public ResponseEntity<?> applyForCard(

            @RequestParam Long userId,

            @RequestParam Long creditCardId,

            Authentication authentication) {

        try {

            // -------------------------------------------------
            // CHECK AUTHENTICATION
            // -------------------------------------------------

            if (authentication == null ||
                    authentication.getName() == null) {

                return ResponseEntity
                        .status(401)
                        .body(
                                Map.of(
                                        "message",
                                        "Authentication required"
                                )
                        );
            }

            // -------------------------------------------------
            // GET LOGGED-IN USER FROM JWT
            // -------------------------------------------------

            String email = authentication.getName();

            User loggedInUser =
                    userService.findByEmail(email);

            // -------------------------------------------------
            // SECURITY CHECK
            // -------------------------------------------------

            if (!loggedInUser.getId().equals(userId)) {

                return ResponseEntity
                        .status(403)
                        .body(
                                Map.of(
                                        "message",
                                        "You are not allowed to apply on behalf of another user."
                                )
                        );
            }

            // -------------------------------------------------
            // APPLY FOR CARD
            // -------------------------------------------------

            Application application =
                    applicationService.applyForCard(
                            userId,
                            creditCardId
                    );

            // -------------------------------------------------
            // SUCCESS
            // -------------------------------------------------

            return ResponseEntity
                    .ok(application);

        } catch (IllegalStateException e) {

            // -------------------------------------------------
            // APPLICATION CONFLICT
            // -------------------------------------------------

            return ResponseEntity
                    .status(409)
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }

    // =====================================================
    // GET CURRENT USER APPLICATIONS
    // =====================================================

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getApplicationsByUser(

            @PathVariable Long userId,

            Authentication authentication) {

        try {

            // -------------------------------------------------
            // CHECK AUTHENTICATION
            // -------------------------------------------------

            if (authentication == null ||
                    authentication.getName() == null) {

                return ResponseEntity
                        .status(401)
                        .body(
                                Map.of(
                                        "message",
                                        "Authentication required"
                                )
                        );
            }

            // -------------------------------------------------
            // GET LOGGED-IN USER
            // -------------------------------------------------

            String email = authentication.getName();

            User loggedInUser =
                    userService.findByEmail(email);

            // -------------------------------------------------
            // SECURITY CHECK
            // -------------------------------------------------

            if (!loggedInUser.getId().equals(userId)) {

                return ResponseEntity
                        .status(403)
                        .body(
                                Map.of(
                                        "message",
                                        "You are not allowed to view another user's applications."
                                )
                        );
            }

            // -------------------------------------------------
            // GET APPLICATIONS
            // -------------------------------------------------

            List<Application> applications =
                    applicationService
                            .getApplicationsByUser(userId);

            return ResponseEntity
                    .ok(applications);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }

    // =====================================================
    // GET APPLICATION BY ID
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getApplicationById(
            @PathVariable Long id) {

        try {

            return ResponseEntity
                    .ok(
                            applicationService
                                    .getApplicationById(id)
                    );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }

    // =====================================================
    // GET APPLICATIONS BY CREDIT CARD
    // =====================================================

    @GetMapping("/card/{creditCardId}")
    public ResponseEntity<List<Application>>
    getApplicationsByCard(
            @PathVariable Long creditCardId) {

        return ResponseEntity
                .ok(
                        applicationService
                                .getApplicationsByCard(
                                        creditCardId
                                )
                );
    }

    // =====================================================
    // GET APPLICATIONS BY STATUS
    // =====================================================

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Application>>
    getApplicationsByStatus(
            @PathVariable String status) {

        return ResponseEntity
                .ok(
                        applicationService
                                .getApplicationsByStatus(
                                        status
                                )
                );
    }
}