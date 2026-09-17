package com.cardwise.cardwise.service;

import com.cardwise.cardwise.entity.RefreshToken;
import com.cardwise.cardwise.entity.User;
import com.cardwise.cardwise.repository.RefreshTokenRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository repository;

    private final long expirationDays;

    private final SecureRandom secureRandom =
            new SecureRandom();

    public RefreshTokenService(
            RefreshTokenRepository repository,
            @Value("${JWT_REFRESH_EXPIRATION_DAYS:30}")
            long expirationDays
    ) {
        this.repository = repository;
        this.expirationDays = expirationDays;
    }

    @Transactional
    public String create(User user) {

        String rawToken = generateSecureToken();

        RefreshToken token = new RefreshToken();

        token.setUser(user);
        token.setTokenHash(hash(rawToken));
        token.setExpiresAt(
                LocalDateTime.now()
                        .plusDays(expirationDays)
        );
        token.setCreatedAt(LocalDateTime.now());
        token.setRevoked(false);

        repository.save(token);

        return rawToken;
    }

    @Transactional
    public User validate(String rawToken) {

        RefreshToken token =
                repository
                        .findByTokenHash(hash(rawToken))
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Invalid refresh token."
                                )
                        );

        if (token.isRevoked()) {
            throw new IllegalArgumentException(
                    "Refresh token has been revoked."
            );
        }

        if (token.getExpiresAt()
                .isBefore(LocalDateTime.now())) {

            token.setRevoked(true);
            token.setRevokedAt(LocalDateTime.now());

            repository.save(token);

            throw new IllegalArgumentException(
                    "Refresh token has expired."
            );
        }

        return token.getUser();
    }

    @Transactional
    public void revoke(String rawToken) {

        repository
                .findByTokenHash(hash(rawToken))
                .ifPresent(token -> {

                    token.setRevoked(true);
                    token.setRevokedAt(
                            LocalDateTime.now()
                    );

                    repository.save(token);
                });
    }

    @Transactional
    public void revokeAll(User user) {

        repository
                .findByUserIdAndRevokedFalse(user.getId())
                .forEach(token -> {

                    token.setRevoked(true);
                    token.setRevokedAt(
                            LocalDateTime.now()
                    );
                });
    }

    private String generateSecureToken() {

        byte[] bytes = new byte[64];

        secureRandom.nextBytes(bytes);

        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(bytes);
    }

    private String hash(String value) {

        try {

            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            byte[] result =
                    digest.digest(
                            value.getBytes(
                                    StandardCharsets.UTF_8
                            )
                    );

            return Base64.getEncoder()
                    .encodeToString(result);

        } catch (Exception e) {

            throw new IllegalStateException(
                    "Unable to hash refresh token.",
                    e
            );
        }
    }
}