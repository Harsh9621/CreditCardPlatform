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

    @Bean
    CommandLineRunner createAdminUser(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {

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
            // CHECK EXISTING ADMIN
            // =================================================

            String normalizedEmail =
                    adminEmail.trim().toLowerCase();

            if (userRepository.existsByEmail(
                    normalizedEmail)) {

                System.out.println(
                        "CardWise ADMIN already exists."
                );

                return;
            }

            // =================================================
            // CREATE ADMIN
            // =================================================

            User admin = new User();

            admin.setName("CardWise Admin");

            admin.setEmail(
                    normalizedEmail
            );

            admin.setPassword(
                    passwordEncoder.encode(
                            adminPassword
                    )
            );

            admin.setRole(
                    UserRole.ADMIN
            );

            admin.setActive(true);

            userRepository.save(admin);

            // =================================================
            // SUCCESS MESSAGE
            // =================================================

            System.out.println(
                    "CardWise ADMIN account created successfully."
            );
        };
    }
}