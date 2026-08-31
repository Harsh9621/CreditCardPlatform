package com.cardwise.cardwise;

import com.cardwise.cardwise.entity.User;
import com.cardwise.cardwise.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminSeeder {

    @Bean
    CommandLineRunner createAdminUser(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {

            String adminEmail = "admin@cardwise.com";

            if (userRepository.existsByEmail(adminEmail)) {
                System.out.println("=================================");
                System.out.println("CardWise ADMIN already exists");
                System.out.println("=================================");
                return;
            }

            User admin = new User();

            admin.setName("CardWise Admin");
            admin.setEmail(adminEmail);
            admin.setPassword(
                    passwordEncoder.encode("Admin@123")
            );
            admin.setRole("ADMIN");

            userRepository.save(admin);

            System.out.println("=================================");
            System.out.println("CardWise ADMIN account created");
            System.out.println("Email: admin@cardwise.com");
            System.out.println("Password: Admin@123");
            System.out.println("Role: ADMIN");
            System.out.println("=================================");
        };
    }
}