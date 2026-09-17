package com.cardwise.cardwise.service;

import com.cardwise.cardwise.entity.User;
import com.cardwise.cardwise.entity.enums.UserRole;
import com.cardwise.cardwise.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // =====================================================
    // REGISTER USER
    // =====================================================

    public User registerUser(User user) {

        if (user == null) {
            throw new RuntimeException(
                    "User data is required"
            );
        }

        if (user.getName() == null ||
                user.getName().isBlank()) {

            throw new RuntimeException(
                    "Name is required"
            );
        }

        if (user.getEmail() == null ||
                user.getEmail().isBlank()) {

            throw new RuntimeException(
                    "Email is required"
            );
        }

        if (user.getPassword() == null ||
                user.getPassword().isBlank()) {

            throw new RuntimeException(
                    "Password is required"
            );
        }

        if (user.getPassword().length() < 6) {

            throw new RuntimeException(
                    "Password must contain at least 6 characters"
            );
        }

        String email =
                user.getEmail()
                        .trim()
                        .toLowerCase();

        if (userRepository.existsByEmail(email)) {

            throw new RuntimeException(
                    "Email already registered"
            );
        }

        user.setEmail(email);

        // =================================================
        // PHONE
        // =================================================

        if (user.getPhone() != null &&
                !user.getPhone().isBlank()) {

            String phone =
                    normalizePhone(
                            user.getPhone()
                    );

            if (phone.length() != 10) {

                throw new RuntimeException(
                        "Enter a valid 10-digit mobile number"
                );
            }

            if (userRepository.existsByPhone(phone)) {

                throw new RuntimeException(
                        "Mobile number already registered"
                );
            }

            user.setPhone(phone);
        }

        // =================================================
        // USER DETAILS
        // =================================================

        user.setName(
                user.getName().trim()
        );

        /*
         * Public registration must always create a USER.
         * Never trust a role supplied by the frontend.
         */
        user.setRole(UserRole.USER);

        user.setActive(true);

        // =================================================
        // HASH PASSWORD
        // =================================================

        user.setPassword(
                passwordEncoder.encode(
                        user.getPassword()
                )
        );

        return userRepository.save(user);
    }

    // =====================================================
    // GOOGLE LOGIN / OAUTH USER
    // =====================================================

    public User findOrCreateGoogleUser(
            String name,
            String email) {

        if (email == null || email.isBlank()) {

            throw new RuntimeException(
                    "Google account email is required"
            );
        }

        String normalizedEmail =
                email.trim().toLowerCase();

        User existingUser =
                findByEmail(normalizedEmail);

        // =================================================
        // EXISTING CARDWISE USER
        // =================================================

        if (existingUser != null) {

            if (!existingUser.isActive()) {

                throw new RuntimeException(
                        "Your CardWise account has been blocked."
                );
            }

            /*
             * Do NOT change the user's existing role.
             * This is important for ADMIN accounts.
             */
            return existingUser;
        }

        // =================================================
        // CREATE NEW CARDWISE USER
        // =================================================

        User googleUser = new User();

        String safeName =
                name != null && !name.isBlank()
                        ? name.trim()
                        : normalizedEmail.split("@")[0];

        googleUser.setName(safeName);
        googleUser.setEmail(normalizedEmail);

        /*
         * Google users may not have a phone number yet.
         * They can add it later from Profile.
         */
        googleUser.setPhone(null);

        /*
         * The database currently requires a password.
         * Google users do not use this password for login,
         * so create a strong random value that is never shown.
         */
        String randomPassword =
                UUID.randomUUID().toString()
                        + UUID.randomUUID();

        googleUser.setPassword(
                passwordEncoder.encode(
                        randomPassword
                )
        );

        googleUser.setRole(UserRole.USER);
        googleUser.setActive(true);

        return userRepository.save(googleUser);
    }

    // =====================================================
    // FIND BY EMAIL
    // =====================================================

    public User findByEmail(String email) {

        if (email == null ||
                email.isBlank()) {

            return null;
        }

        return userRepository
                .findByEmail(
                        email.trim().toLowerCase()
                )
                .orElse(null);
    }

    // =====================================================
    // FIND BY PHONE
    // =====================================================

    public User findByPhone(String phone) {

        if (phone == null ||
                phone.isBlank()) {

            return null;
        }

        String normalizedPhone =
                normalizePhone(phone);

        if (normalizedPhone.length() != 10) {

            return null;
        }

        return userRepository
                .findByPhone(normalizedPhone)
                .orElse(null);
    }

    // =====================================================
    // FIND BY ID
    // =====================================================

    public User findById(Long id) {

        if (id == null) {

            throw new RuntimeException(
                    "User ID is required"
            );
        }

        return userRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );
    }

    // =====================================================
    // UPDATE PASSWORD
    // =====================================================

    public User updatePassword(
            Long id,
            String newPassword) {

        if (id == null) {

            throw new RuntimeException(
                    "User ID is required"
            );
        }

        if (newPassword == null ||
                newPassword.isBlank()) {

            throw new RuntimeException(
                    "New password is required"
            );
        }

        if (newPassword.length() < 6) {

            throw new RuntimeException(
                    "Password must contain at least 6 characters"
            );
        }

        User user = findById(id);

        user.setPassword(
                passwordEncoder.encode(
                        newPassword
                )
        );

        return userRepository.save(user);
    }

    // =====================================================
    // GET ALL USERS
    // =====================================================

    public List<User> getAllUsers() {

        return userRepository
                .findAllByOrderByIdDesc();
    }

    // =====================================================
    // UPDATE PROFILE
    // =====================================================

    public User updateProfile(
            Long id,
            User updatedUser) {

        User user = findById(id);

        if (updatedUser == null) {

            throw new RuntimeException(
                    "Profile data is required"
            );
        }

        // =================================================
        // NAME
        // =================================================

        if (updatedUser.getName() != null &&
                !updatedUser.getName().isBlank()) {

            user.setName(
                    updatedUser.getName().trim()
            );
        }

        // =================================================
        // PHONE
        // =================================================

        if (updatedUser.getPhone() != null) {

            String phone =
                    normalizePhone(
                            updatedUser.getPhone()
                    );

            if (phone.isBlank()) {

                user.setPhone(null);

            } else {

                if (phone.length() != 10) {

                    throw new RuntimeException(
                            "Enter a valid 10-digit mobile number"
                    );
                }

                User existingUser =
                        userRepository
                                .findByPhone(phone)
                                .orElse(null);

                if (existingUser != null &&
                        !existingUser.getId()
                                .equals(id)) {

                    throw new RuntimeException(
                            "Mobile number already registered"
                    );
                }

                user.setPhone(phone);
            }
        }

        // =================================================
        // ADDRESS
        // =================================================

        if (updatedUser.getAddress() != null) {

            user.setAddress(
                    updatedUser.getAddress().trim()
            );
        }

        // =================================================
        // CITY
        // =================================================

        if (updatedUser.getCity() != null) {

            user.setCity(
                    updatedUser.getCity().trim()
            );
        }

        // =================================================
        // STATE
        // =================================================

        if (updatedUser.getState() != null) {

            user.setState(
                    updatedUser.getState().trim()
            );
        }

        // =================================================
        // PINCODE
        // =================================================

        if (updatedUser.getPincode() != null) {

            user.setPincode(
                    updatedUser.getPincode().trim()
            );
        }

        return userRepository.save(user);
    }

    // =====================================================
    // BLOCK USER
    // =====================================================

    public User blockUser(Long id) {

        User user = findById(id);

        if (user.getRole() == UserRole.ADMIN) {

            throw new RuntimeException(
                    "Administrator cannot be blocked"
            );
        }

        user.setActive(false);

        return userRepository.save(user);
    }

    // =====================================================
    // UNBLOCK USER
    // =====================================================

    public User unblockUser(Long id) {

        User user = findById(id);

        user.setActive(true);

        return userRepository.save(user);
    }

    // =====================================================
    // CHECK PASSWORD
    // =====================================================

    public boolean checkPassword(
            String rawPassword,
            String encodedPassword) {

        if (rawPassword == null ||
                rawPassword.isBlank()) {

            return false;
        }

        if (encodedPassword == null ||
                encodedPassword.isBlank()) {

            return false;
        }

        return passwordEncoder.matches(
                rawPassword,
                encodedPassword
        );
    }

    // =====================================================
    // NORMALIZE PHONE
    // =====================================================

    private String normalizePhone(String phone) {

        if (phone == null) {
            return "";
        }

        String digits =
                phone.replaceAll(
                        "[^0-9]",
                        ""
                );

        if (digits.length() == 10) {
            return digits;
        }

        if (digits.length() == 12 &&
                digits.startsWith("91")) {

            return digits.substring(2);
        }

        if (digits.length() == 11 &&
                digits.startsWith("0")) {

            return digits.substring(1);
        }

        return digits;
    }
}