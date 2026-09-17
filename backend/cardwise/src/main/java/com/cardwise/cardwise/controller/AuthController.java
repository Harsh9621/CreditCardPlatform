package com.cardwise.cardwise.controller;

import com.cardwise.cardwise.entity.User;
import com.cardwise.cardwise.entity.enums.UserRole;
import com.cardwise.cardwise.service.JwtService;
import com.cardwise.cardwise.service.OtpService;
import com.cardwise.cardwise.service.UserService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "https://credit-card-platform-silk.vercel.app"
})
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;
    private final OtpService otpService;

    public AuthController(
            UserService userService,
            JwtService jwtService,
            OtpService otpService) {

        this.userService = userService;
        this.jwtService = jwtService;
        this.otpService = otpService;
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

            user.setEmail(
                    user.getEmail()
                            .trim()
                            .toLowerCase()
            );

            if (user.getPhone() != null &&
                    !user.getPhone().isBlank()) {

                user.setPhone(
                        normalizePhone(user.getPhone())
                );
            }

            User savedUser =
                    userService.registerUser(user);

            String role =
                    savedUser.getRole() != null
                            ? savedUser.getRole().name()
                            : UserRole.USER.name();

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
                            role,

                            "active",
                            savedUser.isActive()
                    )
            );

        } catch (Exception e) {

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
    // NORMAL EMAIL + PASSWORD LOGIN
    // =====================================================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody User user) {

        try {

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

            User existingUser =
                    userService.findByEmail(email);

            if (existingUser == null) {

                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of(
                                "message",
                                "Invalid email or password"
                        ));
            }

            if (!existingUser.isActive()) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(Map.of(
                                "message",
                                "Your account has been blocked."
                        ));
            }

            UserRole userRole =
                    existingUser.getRole();

            if (userRole == null) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(Map.of(
                                "message",
                                "User role is not configured."
                        ));
            }

            String role =
                    userRole.name();

            boolean passwordMatches =
                    userService.checkPassword(
                            user.getPassword(),
                            existingUser.getPassword()
                    );

            if (!passwordMatches) {

                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of(
                                "message",
                                "Invalid email or password"
                        ));
            }

            String token =
                    jwtService.generateToken(
                            existingUser.getEmail(),
                            role
                    );

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
    // LOGIN OTP - REQUEST
    // =====================================================

    @PostMapping("/login/request-otp")
    public ResponseEntity<?> requestLoginOtp(
            @RequestBody Map<String, String> request) {

        try {

            String identifier =
                    request.get("identifier");

            if (identifier == null ||
                    identifier.isBlank()) {

                return ResponseEntity
                        .badRequest()
                        .body(Map.of(
                                "message",
                                "Email or phone number is required"
                        ));
            }

            identifier =
                    normalizeIdentifier(identifier);

            User user =
                    findUserByIdentifier(identifier);

            if (user == null) {

                return ResponseEntity
                        .badRequest()
                        .body(Map.of(
                                "message",
                                "User not found"
                        ));
            }

            if (!user.isActive()) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(Map.of(
                                "message",
                                "Your account has been blocked."
                        ));
            }

            String channel =
                    isEmail(identifier)
                            ? "EMAIL"
                            : "PHONE";

            otpService.generateAndStoreOtp(
                    identifier,
                    channel,
                    "LOGIN"
            );

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "OTP generated successfully"
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message",
                            e.getMessage() != null
                                    ? e.getMessage()
                                    : "Unable to generate OTP"
                    ));

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "message",
                            "Unable to generate OTP. Please try again."
                    ));
        }
    }

    // =====================================================
    // LOGIN OTP - VERIFY
    // =====================================================

    @PostMapping("/login/otp")
    public ResponseEntity<?> loginWithOtp(
            @RequestBody Map<String, String> request) {

        try {

            String identifier =
                    request.get("identifier");

            String otp =
                    request.get("otp");

            if (identifier == null ||
                    identifier.isBlank()) {

                return ResponseEntity
                        .badRequest()
                        .body(Map.of(
                                "message",
                                "Email or phone number is required"
                        ));
            }

            if (otp == null ||
                    otp.isBlank()) {

                return ResponseEntity
                        .badRequest()
                        .body(Map.of(
                                "message",
                                "OTP is required"
                        ));
            }

            identifier =
                    normalizeIdentifier(identifier);

            otp =
                    otp.trim();

            User user =
                    findUserByIdentifier(identifier);

            if (user == null) {

                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of(
                                "message",
                                "User not found"
                        ));
            }

            if (!user.isActive()) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(Map.of(
                                "message",
                                "Your account has been blocked."
                        ));
            }

            boolean verified =
                    otpService.verifyOtp(
                            identifier,
                            "LOGIN",
                            otp
                    );

            if (!verified) {

                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of(
                                "message",
                                "Invalid or expired OTP"
                        ));
            }

            UserRole userRole =
                    user.getRole();

            if (userRole == null) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(Map.of(
                                "message",
                                "User role is not configured."
                        ));
            }

            if (user.getEmail() == null ||
                    user.getEmail().isBlank()) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(Map.of(
                                "message",
                                "User email is required for login."
                        ));
            }

            String role =
                    userRole.name();

            String token =
                    jwtService.generateToken(
                            user.getEmail(),
                            role
                    );

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Login successful",

                            "token",
                            token,

                            "id",
                            user.getId(),

                            "name",
                            user.getName(),

                            "email",
                            user.getEmail(),

                            "role",
                            role,

                            "active",
                            user.isActive()
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message",
                            e.getMessage() != null
                                    ? e.getMessage()
                                    : "OTP login failed"
                    ));

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "message",
                            "OTP login failed. Please try again."
                    ));
        }
    }

    // =====================================================
    // FORGOT PASSWORD - REQUEST OTP
    // =====================================================

    @PostMapping("/forgot-password/request-otp")
    public ResponseEntity<?> requestForgotPasswordOtp(
            @RequestBody Map<String, String> request) {

        try {

            String identifier =
                    request.get("identifier");

            if (identifier == null ||
                    identifier.isBlank()) {

                return ResponseEntity
                        .badRequest()
                        .body(Map.of(
                                "message",
                                "Email or phone number is required"
                        ));
            }

            identifier =
                    normalizeIdentifier(identifier);

            User user =
                    findUserByIdentifier(identifier);

            if (user == null) {

                return ResponseEntity
                        .badRequest()
                        .body(Map.of(
                                "message",
                                "User not found"
                        ));
            }

            if (!user.isActive()) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(Map.of(
                                "message",
                                "Your account has been blocked."
                        ));
            }

            String channel =
                    isEmail(identifier)
                            ? "EMAIL"
                            : "PHONE";

            otpService.generateAndStoreOtp(
                    identifier,
                    channel,
                    "PASSWORD_RESET"
            );

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "OTP generated successfully"
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message",
                            e.getMessage() != null
                                    ? e.getMessage()
                                    : "Unable to send OTP"
                    ));

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "message",
                            "Unable to send OTP. Please try again."
                    ));
        }
    }

    // =====================================================
    // FORGOT PASSWORD - VERIFY OTP
    // =====================================================

    @PostMapping("/forgot-password/verify-otp")
    public ResponseEntity<?> verifyForgotPasswordOtp(
            @RequestBody Map<String, String> request) {

        try {

            String identifier =
                    request.get("identifier");

            String otp =
                    request.get("otp");

            if (identifier == null ||
                    identifier.isBlank()) {

                return ResponseEntity
                        .badRequest()
                        .body(Map.of(
                                "message",
                                "Email or phone number is required"
                        ));
            }

            if (otp == null ||
                    otp.isBlank()) {

                return ResponseEntity
                        .badRequest()
                        .body(Map.of(
                                "message",
                                "OTP is required"
                        ));
            }

            identifier =
                    normalizeIdentifier(identifier);

            boolean verified =
                    otpService.verifyOtp(
                            identifier,
                            "PASSWORD_RESET",
                            otp.trim()
                    );

            if (!verified) {

                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of(
                                "message",
                                "Invalid or expired OTP"
                        ));
            }

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "OTP verified successfully"
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message",
                            e.getMessage() != null
                                    ? e.getMessage()
                                    : "OTP verification failed"
                    ));
        }
    }

    // =====================================================
    // FORGOT PASSWORD - RESET
    // =====================================================

    @PostMapping("/forgot-password/reset")
    public ResponseEntity<?> resetPassword(
            @RequestBody Map<String, String> request) {

        try {

            String identifier =
                    request.get("identifier");

            String otp =
                    request.get("otp");

            String newPassword =
                    request.get("newPassword");

            if (identifier == null ||
                    identifier.isBlank()) {

                return ResponseEntity
                        .badRequest()
                        .body(Map.of(
                                "message",
                                "Email or phone number is required"
                        ));
            }

            if (otp == null ||
                    otp.isBlank()) {

                return ResponseEntity
                        .badRequest()
                        .body(Map.of(
                                "message",
                                "OTP is required"
                        ));
            }

            if (newPassword == null ||
                    newPassword.isBlank()) {

                return ResponseEntity
                        .badRequest()
                        .body(Map.of(
                                "message",
                                "New password is required"
                        ));
            }

            if (newPassword.length() < 6) {

                return ResponseEntity
                        .badRequest()
                        .body(Map.of(
                                "message",
                                "Password must contain at least 6 characters"
                        ));
            }

            identifier =
                    normalizeIdentifier(identifier);

            User user =
                    findUserByIdentifier(identifier);

            if (user == null) {

                return ResponseEntity
                        .badRequest()
                        .body(Map.of(
                                "message",
                                "User not found"
                        ));
            }

            if (!user.isActive()) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(Map.of(
                                "message",
                                "Your account has been blocked."
                        ));
            }

            boolean verified =
                    otpService.verifyOtp(
                            identifier,
                            "PASSWORD_RESET",
                            otp.trim()
                    );

            if (!verified) {

                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of(
                                "message",
                                "Invalid or expired OTP"
                        ));
            }

            userService.updatePassword(
                    user.getId(),
                    newPassword
            );

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Password reset successfully"
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message",
                            e.getMessage() != null
                                    ? e.getMessage()
                                    : "Password reset failed"
                    ));

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "message",
                            "Password reset failed. Please try again."
                    ));
        }
    }

    // =====================================================
    // FIND USER BY EMAIL / PHONE
    // =====================================================

    private User findUserByIdentifier(
            String identifier) {

        if (identifier == null ||
                identifier.isBlank()) {

            return null;
        }

        identifier =
                identifier.trim();

        // EMAIL
        if (isEmail(identifier)) {

            return userService.findByEmail(
                    identifier.toLowerCase()
            );
        }

        // PHONE
        String phone =
                normalizePhone(identifier);

        User user =
                userService.findByPhone(phone);

        if (user != null) {
            return user;
        }

        user =
                userService.findByPhone(
                        "+91" + phone
                );

        if (user != null) {
            return user;
        }

        user =
                userService.findByPhone(
                        "91" + phone
                );

        if (user != null) {
            return user;
        }

        return userService.findByPhone(
                "+91 " + phone
        );
    }

    // =====================================================
    // IDENTIFIER NORMALIZATION
    // =====================================================

    private String normalizeIdentifier(
            String identifier) {

        if (identifier == null) {
            return null;
        }

        identifier =
                identifier.trim();

        if (identifier.contains("@")) {

            return identifier.toLowerCase();
        }

        return normalizePhone(identifier);
    }

    // =====================================================
    // PHONE NORMALIZATION
    // =====================================================

    private String normalizePhone(
            String phone) {

        if (phone == null) {
            return null;
        }

        String digits =
                phone.replaceAll(
                        "[^0-9]",
                        ""
                );

        // 10 digits
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

    // =====================================================
    // EMAIL CHECK
    // =====================================================

    private boolean isEmail(
            String identifier) {

        return identifier != null &&
                identifier.contains("@");
    }
}