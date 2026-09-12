package com.cardwise.cardwise;

import com.cardwise.cardwise.entity.User;
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

            if (adminPassword == null ||
                    adminPassword.isBlank()) {

                System.out.println(
                        "CardWise ADMIN seeding skipped: " +
                        "ADMIN_PASSWORD is not configured."
                );

                return;
            }

            if (userRepository.existsByEmail(adminEmail)) {

                System.out.println(
                        "CardWise ADMIN already exists: " +
                        adminEmail
                );

                return;
            }

            User admin = new User();

            admin.setName("CardWise Admin");

            admin.setEmail(
                    adminEmail.trim().toLowerCase()
            );

            admin.setPassword(
                    passwordEncoder.encode(adminPassword)
            );

            admin.setRole("ADMIN");
            admin.setActive(true);

            userRepository.save(admin);

            System.out.println(
                    "CardWise ADMIN account created successfully."
            );

            System.out.println(
                    "Admin email: " + adminEmail
            );

            System.out.println(
                    "Admin password is configured securely " +
                    "through environment variables."
            );
        };
    }
}
