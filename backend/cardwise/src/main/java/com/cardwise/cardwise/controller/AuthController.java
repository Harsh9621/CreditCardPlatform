package com.cardwise.cardwise.controller;

import com.cardwise.cardwise.entity.User;
import com.cardwise.cardwise.service.JwtService;
import com.cardwise.cardwise.service.UserService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;

    public AuthController(
            UserService userService,
            JwtService jwtService) {

        this.userService = userService;
        this.jwtService = jwtService;
    }

    // =====================================================
    // REGISTER
    // =====================================================

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody User user) {

        try {

            if (user.getName() == null ||
                    user.getName().isBlank()) {

                return ResponseEntity
                        .badRequest()
                        .body(Map.of(
                                "message",
                                "Name is required"
                        ));
            }

            if (user.getEmail() == null ||
                    user.getEmail().isBlank()) {

                return ResponseEntity
                        .badRequest()
                        .body(Map.of(
                                "message",
                                "Email is required"
                        ));
            }

            if (user.getPassword() == null ||
                    user.getPassword().isBlank()) {

                return ResponseEntity
                        .badRequest()
                        .body(Map.of(
                                "message",
                                "Password is required"
                        ));
            }

            User savedUser =
                    userService.registerUser(user);

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Registration successful",

                            "id",
                            savedUser.getId(),

                            "name",
                            savedUser.getName(),

                            "email",
                            savedUser.getEmail(),

                            "role",
                            savedUser.getRole(),

                            "active",
                            savedUser.isActive()
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage() != null
                                            ? e.getMessage()
                                            : "Registration failed"
                            )
                    );
        }
    }

    // =====================================================
    // LOGIN
    // =====================================================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody User user) {

        try {

            System.out.println();
            System.out.println("=================================");
            System.out.println("CARDWISE LOGIN");
            System.out.println("=================================");

            // -------------------------------------------------
            // VALIDATION
            // -------------------------------------------------

            if (user.getEmail() == null ||
                    user.getEmail().isBlank()) {

                return ResponseEntity
                        .badRequest()
                        .body(Map.of(
                                "message",
                                "Email is required"
                        ));
            }

            if (user.getPassword() == null ||
                    user.getPassword().isBlank()) {

                return ResponseEntity
                        .badRequest()
                        .body(Map.of(
                                "message",
                                "Password is required"
                        ));
            }

            String email =
                    user.getEmail()
                            .trim()
                            .toLowerCase();

            System.out.println(
                    "Login email: " + email
            );

            // -------------------------------------------------
            // FIND USER
            // -------------------------------------------------

            User existingUser =
                    userService.findByEmail(email);

            System.out.println(
                    "User found: "
                            + existingUser.getEmail()
            );

            System.out.println(
                    "User ID: "
                            + existingUser.getId()
            );

            System.out.println(
                    "Database role: "
                            + existingUser.getRole()
            );

            System.out.println(
                    "Account active: "
                            + existingUser.isActive()
            );

            // -------------------------------------------------
            // CHECK ACTIVE
            // -------------------------------------------------

            if (!existingUser.isActive()) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(Map.of(
                                "message",
                                "Your account has been blocked."
                        ));
            }

            // -------------------------------------------------
            // CHECK ROLE
            // -------------------------------------------------

            if (existingUser.getRole() == null ||
                    existingUser.getRole().isBlank()) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(Map.of(
                                "message",
                                "User role is not configured."
                        ));
            }

            String role =
                    existingUser.getRole()
                            .trim()
                            .toUpperCase();

            // -------------------------------------------------
            // CHECK PASSWORD
            // -------------------------------------------------

            boolean passwordMatches =
                    userService.checkPassword(
                            user.getPassword(),
                            existingUser.getPassword()
                    );

            System.out.println(
                    "Password matches: "
                            + passwordMatches
            );

            if (!passwordMatches) {

                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(
                                Map.of(
                                        "message",
                                        "Invalid email or password"
                                )
                        );
            }

            // -------------------------------------------------
            // GENERATE JWT
            // -------------------------------------------------

            String token =
                    jwtService.generateToken(
                            existingUser.getEmail()
                    );

            System.out.println(
                    "JWT generated"
            );

            System.out.println(
                    "Login role: ROLE_" + role
            );

            System.out.println(
                    "================================="
            );
            System.out.println();

            // -------------------------------------------------
            // RESPONSE
            // -------------------------------------------------

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Login successful",

                            "token",
                            token,

                            "id",
                            existingUser.getId(),

                            "name",
                            existingUser.getName(),

                            "email",
                            existingUser.getEmail(),

                            "role",
                            role,

                            "active",
                            existingUser.isActive()
                    )
            );

        } catch (RuntimeException e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage() != null
                                            ? e.getMessage()
                                            : "Invalid email or password"
                            )
                    );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            Map.of(
                                    "message",
                                    "Login failed. Please try again."
                            )
                    );
        }
    }

    // =====================================================
    // RESET ADMIN PASSWORD
    // =====================================================

    @GetMapping("/reset-admin")
    public ResponseEntity<?> resetAdminPassword() {

        try {

            userService.resetAdminPassword();

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Admin password reset successfully",

                            "email",
                            "admin@cardwise.com",

                            "password",
                            "Admin@123"
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage() != null
                                            ? e.getMessage()
                                            : "Admin password reset failed"
                            )
                    );
        }
    }

    // =====================================================
    // TEST ADMIN PASSWORD
    // =====================================================

    @GetMapping("/test-admin-password")
    public ResponseEntity<?> testAdminPassword() {

        try {

            boolean matches =
                    userService.testAdminPassword();

            return ResponseEntity.ok(
                    Map.of(
                            "email",
                            "admin@cardwise.com",

                            "passwordMatches",
                            matches
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage() != null
                                            ? e.getMessage()
                                            : "Password test failed"
                            )
                    );
        }
    }
}