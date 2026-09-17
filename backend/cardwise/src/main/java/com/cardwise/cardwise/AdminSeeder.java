package com.cardwise.cardwise;

import com.cardwise.cardwise.entity.User;
import com.cardwise.cardwise.entity.enums.UserRole;
import com.cardwise.cardwise.repository.UserRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminSeeder {

    @Value("${ADMIN_EMAIL:admin@cardwise.com}")
    private String adminEmail;

    @Value("${ADMIN_PASSWORD:}")
    private String adminPassword;

    // Explicit development-only password reset flag
    @Value("${ADMIN_RESET_PASSWORD:false}")
    private boolean resetAdminPassword;

    @Bean
    CommandLineRunner createAdminUser(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {

            // =================================================
            // NORMALIZE ADMIN EMAIL
            // =================================================

            String normalizedEmail =
                    adminEmail.trim().toLowerCase();

            // =================================================
            // CHECK ADMIN PASSWORD
            // =================================================

            if (adminPassword == null ||
                    adminPassword.isBlank()) {

                System.out.println(
                        "CardWise ADMIN seeding skipped: " +
                        "ADMIN_PASSWORD is not configured."
                );

                return;
            }

            // =================================================
            // FIND EXISTING USER
            // =================================================

            User existingUser =
                    userRepository.findByEmail(normalizedEmail)
                            .orElse(null);

            // =================================================
            // ADMIN DOES NOT EXIST → CREATE
            // =================================================

            if (existingUser == null) {

                User admin = new User();

                admin.setName("CardWise Admin");
                admin.setEmail(normalizedEmail);

                admin.setPassword(
                        passwordEncoder.encode(adminPassword)
                );

                admin.setRole(UserRole.ADMIN);
                admin.setActive(true);

                userRepository.save(admin);

                System.out.println(
                        "CardWise ADMIN account created successfully."
                );

                return;
            }

            // =================================================
            // ADMIN EXISTS → OPTIONAL PASSWORD RESET
            // =================================================

            if (resetAdminPassword) {

                // Safety check: only modify an existing ADMIN
                if (existingUser.getRole() != UserRole.ADMIN) {

                    System.out.println(
                            "CardWise ADMIN password reset skipped: " +
                            "existing account is not an ADMIN."
                    );

                    return;
                }

                existingUser.setPassword(
                        passwordEncoder.encode(adminPassword)
                );

                existingUser.setActive(true);

                userRepository.save(existingUser);

                System.out.println(
                        "CardWise ADMIN password reset successfully."
                );

                return;
            }

            // =================================================
            // EXISTING ADMIN → NO CHANGE
            // =================================================

            System.out.println(
                    "CardWise ADMIN already exists. " +
                    "No changes made."
            );
        };
    }
}
