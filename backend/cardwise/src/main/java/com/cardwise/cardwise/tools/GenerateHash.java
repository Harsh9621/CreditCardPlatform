package com.cardwise.cardwise.tools;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GenerateHash {
    public static void main(String[] args) {
        String password = System.getenv("TEMP_PASSWORD");

        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("TEMP_PASSWORD is not set.");
        }

        System.out.println(new BCryptPasswordEncoder().encode(password));
    }
}
