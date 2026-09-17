package com.cardwise.cardwise.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final Map<String, Bucket> buckets =
            new ConcurrentHashMap<>();

    private static final int CAPACITY = 20;
    private static final int REFILL_TOKENS = 20;
    private static final Duration REFILL_DURATION =
            Duration.ofMinutes(1);

    private Bucket createBucket() {

        Refill refill = Refill.intervally(
                REFILL_TOKENS,
                REFILL_DURATION
        );

        Bandwidth limit = Bandwidth.classic(
                CAPACITY,
                refill
        );

        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    private Bucket getBucket(String key) {
        return buckets.computeIfAbsent(
                key,
                ignored -> createBucket()
        );
    }

    private String getClientKey(
            HttpServletRequest request) {

        String forwardedFor =
                request.getHeader("X-Forwarded-For");

        if (forwardedFor != null
                && !forwardedFor.isBlank()) {

            return forwardedFor
                    .split(",")[0]
                    .trim();
        }

        String realIp =
                request.getHeader("X-Real-IP");

        if (realIp != null
                && !realIp.isBlank()) {

            return realIp.trim();
        }

        return request.getRemoteAddr();
    }

    private boolean isRateLimitedEndpoint(
            HttpServletRequest request) {

        String uri = request.getRequestURI();

        return uri.startsWith("/api/auth/")
                || uri.startsWith("/api/contact");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        if (!isRateLimitedEndpoint(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        if ("OPTIONS".equalsIgnoreCase(
                request.getMethod())) {

            filterChain.doFilter(request, response);
            return;
        }

        String clientKey =
                getClientKey(request);

        Bucket bucket =
                getBucket(clientKey);

        if (bucket.tryConsume(1)) {

            filterChain.doFilter(request, response);
            return;
        }

        response.setStatus(
                HttpStatus.TOO_MANY_REQUESTS.value()
        );

        response.setContentType(
                "application/json"
        );

        response.setCharacterEncoding("UTF-8");

        response.setHeader(
                "Retry-After",
                "60"
        );

        response.getWriter().write(
                "{\"message\":\"Too many requests. Please try again later.\"}"
        );
    }
}