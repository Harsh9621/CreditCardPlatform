package com.cardwise.cardwise.controller;

import com.cardwise.cardwise.entity.Application;
import com.cardwise.cardwise.service.ApplicationService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/applications")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminApplicationController {

    private final ApplicationService applicationService;

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public AdminApplicationController(
            ApplicationService applicationService) {

        this.applicationService = applicationService;
    }


    // =====================================================
    // GET ALL APPLICATIONS
    // =====================================================

    @GetMapping
    public ResponseEntity<?> getAllApplications() {

        try {

            return ResponseEntity.ok(
                    applicationService.getAllApplications()
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    safeMessage(
                                            e,
                                            "Unable to load applications."
                                    )
                            )
                    );
        }
    }


    // =====================================================
    // GET PENDING APPLICATIONS
    // =====================================================

    @GetMapping("/pending")
    public ResponseEntity<?> getPendingApplications() {

        try {

            return ResponseEntity.ok(
                    applicationService
                            .getApplicationsByStatus("PENDING")
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    safeMessage(
                                            e,
                                            "Unable to load pending applications."
                                    )
                            )
                    );
        }
    }


    // =====================================================
    // GET APPROVED APPLICATIONS
    // =====================================================

    @GetMapping("/approved")
    public ResponseEntity<?> getApprovedApplications() {

        try {

            return ResponseEntity.ok(
                    applicationService
                            .getApplicationsByStatus("APPROVED")
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    safeMessage(
                                            e,
                                            "Unable to load approved applications."
                                    )
                            )
                    );
        }
    }


    // =====================================================
    // GET REJECTED APPLICATIONS
    // =====================================================

    @GetMapping("/rejected")
    public ResponseEntity<?> getRejectedApplications() {

        try {

            return ResponseEntity.ok(
                    applicationService
                            .getApplicationsByStatus("REJECTED")
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    safeMessage(
                                            e,
                                            "Unable to load rejected applications."
                                    )
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

            return ResponseEntity.ok(
                    applicationService.getApplicationById(id)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(404)
                    .body(
                            Map.of(
                                    "message",
                                    "Application not found"
                            )
                    );
        }
    }


    // =====================================================
    // APPROVE APPLICATION
    // =====================================================

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveApplication(
            @PathVariable Long id) {

        try {

            Application application =
                    applicationService.approveApplication(id);

            /*
             * IMPORTANT:
             * Do NOT return the complete Application entity here.
             *
             * Application contains LAZY User/CreditCard relationships.
             * Returning the entity causes Jackson to access those
             * Hibernate proxies after the session is closed.
             */

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Application #" + application.getId()
                                    + " approved successfully",

                            "applicationId",
                            application.getId(),

                            "status",
                            application.getStatus().name()
                    )
            );

        } catch (IllegalStateException e) {

            return ResponseEntity
                    .status(409)
                    .body(
                            Map.of(
                                    "message",
                                    safeMessage(
                                            e,
                                            "Application cannot be approved."
                                    )
                            )
                    );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    safeMessage(
                                            e,
                                            "Unable to approve application."
                                    )
                            )
                    );
        }
    }


    // =====================================================
    // REJECT APPLICATION
    // =====================================================

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectApplication(
            @PathVariable Long id) {

        try {

            Application application =
                    applicationService.rejectApplication(id);

            /*
             * Do NOT return the complete Application entity.
             * Return only simple JSON values.
             */

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Application #" + application.getId()
                                    + " rejected successfully",

                            "applicationId",
                            application.getId(),

                            "status",
                            application.getStatus().name()
                    )
            );

        } catch (IllegalStateException e) {

            return ResponseEntity
                    .status(409)
                    .body(
                            Map.of(
                                    "message",
                                    safeMessage(
                                            e,
                                            "Application cannot be rejected."
                                    )
                            )
                    );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    safeMessage(
                                            e,
                                            "Unable to reject application."
                                    )
                            )
                    );
        }
    }


    // =====================================================
    // GET APPLICATIONS BY STATUS
    // =====================================================

    @GetMapping("/status/{status}")
    public ResponseEntity<?> getApplicationsByStatus(
            @PathVariable String status) {

        try {

            return ResponseEntity.ok(
                    applicationService
                            .getApplicationsByStatus(status)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    safeMessage(
                                            e,
                                            "Unable to load applications."
                                    )
                            )
                    );
        }
    }


    // =====================================================
    // SAFE ERROR MESSAGE
    // =====================================================

    private String safeMessage(
            RuntimeException e,
            String fallback) {

        if (e == null) {
            return fallback;
        }

        String message = e.getMessage();

        if (message == null || message.isBlank()) {
            return fallback;
        }

        return message;
    }
}