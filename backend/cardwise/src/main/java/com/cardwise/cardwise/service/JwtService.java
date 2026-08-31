package com.cardwise.cardwise.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;

import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private static final String SECRET_KEY =
            "CardWiseSecretKeyForJwtAuthentication2026SecureKey";

    private static final long EXPIRATION_TIME =
            1000L * 60 * 60 * 24;

    // =====================================================
    // SIGNING KEY
    // =====================================================

    private SecretKey getSigningKey() {

        return Keys.hmacShaKeyFor(
                SECRET_KEY.getBytes(
                        StandardCharsets.UTF_8
                )
        );
    }

    // =====================================================
    // GENERATE TOKEN
    // =====================================================

    public String generateToken(
            String email) {

        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(
                        new Date(
                                System.currentTimeMillis()
                                        + EXPIRATION_TIME
                        )
                )
                .signWith(
                        getSigningKey()
                )
                .compact();
    }

    // =====================================================
    // EXTRACT EMAIL
    // =====================================================

    public String extractEmail(
            String token) {

        return Jwts.parser()
                .verifyWith(
                        getSigningKey()
                )
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }
}