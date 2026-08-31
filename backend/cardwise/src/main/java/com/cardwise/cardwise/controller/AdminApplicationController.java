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
                                    e.getMessage()
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
                                    e.getMessage()
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
                                    e.getMessage()
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

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Application approved successfully",
                            "application",
                            application
                    )
            );

        } catch (IllegalStateException e) {

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
    // REJECT APPLICATION
    // =====================================================

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectApplication(
            @PathVariable Long id) {

        try {

            Application application =
                    applicationService.rejectApplication(id);

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Application rejected successfully",
                            "application",
                            application
                    )
            );

        } catch (IllegalStateException e) {

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
                                    e.getMessage()
                            )
                    );
        }
    }
}