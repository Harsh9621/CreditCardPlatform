package com.cardwise.cardwise.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

    private final String secretKey;
    private final long accessExpirationMillis;

    public JwtService(
            @Value("${JWT_SECRET}") String secretKey,
            @Value("${JWT_ACCESS_EXPIRATION_MINUTES:15}")
            long expirationMinutes
    ) {

        if (secretKey == null || secretKey.isBlank()) {
            throw new IllegalStateException(
                    "JWT_SECRET environment variable is required."
            );
        }

        int secretLength =
                secretKey.getBytes(StandardCharsets.UTF_8).length;

        if (secretLength < 48) {
            throw new IllegalStateException(
                    "JWT_SECRET must contain at least 48 bytes."
            );
        }

        if (expirationMinutes <= 0) {
            throw new IllegalStateException(
                    "JWT_ACCESS_EXPIRATION_MINUTES must be greater than zero."
            );
        }

        this.secretKey = secretKey;

        this.accessExpirationMillis =
                expirationMinutes * 60_000L;
    }

    // =============================================================
    // SIGNING KEY
    // =============================================================

    private SecretKey getSigningKey() {

        return Keys.hmacShaKeyFor(
                secretKey.getBytes(StandardCharsets.UTF_8)
        );
    }

    // =============================================================
    // GENERATE ACCESS TOKEN
    // =============================================================

    public String generateToken(
            String email,
            String role
    ) {

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException(
                    "Email is required to generate JWT."
            );
        }

        if (role == null || role.isBlank()) {
            throw new IllegalArgumentException(
                    "Role is required to generate JWT."
            );
        }

        Date now = new Date();

        Date expiration =
                new Date(
                        now.getTime()
                                + accessExpirationMillis
                );

        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .subject(email.trim())
                .claim("email", email.trim())
                .claim("role", role.trim().toUpperCase())
                .claim("type", "ACCESS")
                .issuedAt(now)
                .expiration(expiration)
                .signWith(
                        getSigningKey(),
                        Jwts.SIG.HS384
                )
                .compact();
    }

    // =============================================================
    // EXTRACT CLAIMS
    // =============================================================

    public Claims extractClaims(String token) {

        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException(
                    "JWT token is required."
            );
        }

        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // =============================================================
    // EMAIL
    // =============================================================

    public String extractEmail(String token) {

        return extractClaims(token)
                .getSubject();
    }

    // =============================================================
    // ROLE
    // =============================================================

    public String extractRole(String token) {

        return extractClaims(token)
                .get("role", String.class);
    }

    // =============================================================
    // TOKEN TYPE
    // =============================================================

    public String extractTokenType(String token) {

        return extractClaims(token)
                .get("type", String.class);
    }

    // =============================================================
    // JTI
    // =============================================================

    public String extractJti(String token) {

        return extractClaims(token)
                .getId();
    }

    // =============================================================
    // EXPIRATION
    // =============================================================

    public Date extractExpiration(String token) {

        return extractClaims(token)
                .getExpiration();
    }

    // =============================================================
    // EXPIRED
    // =============================================================

    public boolean isTokenExpired(String token) {

        Date expiration =
                extractExpiration(token);

        return expiration == null
                || expiration.before(new Date());
    }
}