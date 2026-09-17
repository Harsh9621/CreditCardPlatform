package com.cardwise.cardwise.security;

import com.cardwise.cardwise.entity.User;
import com.cardwise.cardwise.entity.enums.UserRole;
import com.cardwise.cardwise.service.JwtService;
import com.cardwise.cardwise.service.UserService;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserService userService;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            UserService userService
    ) {
        this.jwtService = jwtService;
        this.userService = userService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String requestUri = request.getRequestURI();

        // =========================================================
        // OPTIONS
        // =========================================================

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        // =========================================================
        // ALREADY AUTHENTICATED
        // =========================================================

        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            filterChain.doFilter(request, response);
            return;
        }

        // =========================================================
        // AUTHORIZATION HEADER
        // =========================================================

        String authHeader =
                request.getHeader("Authorization");

        if (authHeader == null || authHeader.isBlank()) {

            filterChain.doFilter(request, response);
            return;
        }

        if (!authHeader.regionMatches(
                true,
                0,
                "Bearer ",
                0,
                7
        )) {

            sendUnauthorized(
                    response,
                    "Invalid Authorization header."
            );

            return;
        }

        String token =
                authHeader.substring(7).trim();

        if (token.isBlank()) {

            sendUnauthorized(
                    response,
                    "Authentication token is missing."
            );

            return;
        }

        // =========================================================
        // JWT VALIDATION
        // =========================================================

        try {

            // -----------------------------------------------------
            // TOKEN TYPE
            // -----------------------------------------------------

            String tokenType =
                    jwtService.extractTokenType(token);

            if (!"ACCESS".equalsIgnoreCase(tokenType)) {

                sendUnauthorized(
                        response,
                        "Invalid access token."
                );

                return;
            }

            // -----------------------------------------------------
            // EMAIL
            // -----------------------------------------------------

            String email =
                    jwtService.extractEmail(token);

            if (email == null || email.isBlank()) {

                sendUnauthorized(
                        response,
                        "Authentication token does not contain a valid email."
                );

                return;
            }

            email = email.trim();

            // -----------------------------------------------------
            // USER
            // -----------------------------------------------------

            User user =
                    userService.findByEmail(email);

            if (user == null) {

                sendUnauthorized(
                        response,
                        "User account not found."
                );

                return;
            }

            // -----------------------------------------------------
            // ACTIVE ACCOUNT
            // -----------------------------------------------------

            if (!user.isActive()) {

                sendForbidden(
                        response,
                        "Your account is inactive."
                );

                return;
            }

            // -----------------------------------------------------
            // ROLE
            // -----------------------------------------------------

            UserRole role =
                    user.getRole();

            if (role == null) {

                sendForbidden(
                        response,
                        "User role is not configured."
                );

                return;
            }

            // -----------------------------------------------------
            // AUTHORITY
            // -----------------------------------------------------

            String authority =
                    "ROLE_" + role.name().toUpperCase();

            List<SimpleGrantedAuthority> authorities =
                    List.of(
                            new SimpleGrantedAuthority(authority)
                    );

            // -----------------------------------------------------
            // SPRING AUTHENTICATION
            // -----------------------------------------------------

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            user.getEmail(),
                            null,
                            authorities
                    );

            authentication.setDetails(user);

            SecurityContextHolder
                    .getContext()
                    .setAuthentication(authentication);

            // -----------------------------------------------------
            // DEBUG
            // -----------------------------------------------------

            System.out.println(
                    "CardWise JWT authenticated: "
                            + user.getEmail()
                            + " | role="
                            + role.name()
                            + " | authority="
                            + authority
                            + " | endpoint="
                            + requestUri
            );

        } catch (ExpiredJwtException exception) {

            System.err.println(
                    "CardWise JWT expired for endpoint: "
                            + requestUri
            );

            sendUnauthorized(
                    response,
                    "Authentication token has expired."
            );

            return;

        } catch (JwtException exception) {

            System.err.println(
                    "CardWise JWT validation failed: "
                            + exception.getMessage()
            );

            sendUnauthorized(
                    response,
                    "Invalid authentication token."
            );

            return;

        } catch (Exception exception) {

            System.err.println(
                    "CardWise JWT authentication failed: "
                            + exception.getMessage()
            );

            exception.printStackTrace();

            sendUnauthorized(
                    response,
                    "Authentication failed."
            );

            return;
        }

        // =========================================================
        // CONTINUE
        // =========================================================

        filterChain.doFilter(request, response);
    }

    // =============================================================
    // 401
    // =============================================================

    private void sendUnauthorized(
            HttpServletResponse response,
            String message
    ) throws IOException {

        if (response.isCommitted()) {
            return;
        }

        response.setStatus(
                HttpServletResponse.SC_UNAUTHORIZED
        );

        response.setContentType(
                "application/json"
        );

        response.setCharacterEncoding("UTF-8");

        response.getWriter().write(
                "{\"message\":\""
                        + escapeJson(message)
                        + "\"}"
        );
    }

    // =============================================================
    // 403
    // =============================================================

    private void sendForbidden(
            HttpServletResponse response,
            String message
    ) throws IOException {

        if (response.isCommitted()) {
            return;
        }

        response.setStatus(
                HttpServletResponse.SC_FORBIDDEN
        );

        response.setContentType(
                "application/json"
        );

        response.setCharacterEncoding("UTF-8");

        response.getWriter().write(
                "{\"message\":\""
                        + escapeJson(message)
                        + "\"}"
        );
    }

    // =============================================================
    // JSON ESCAPE
    // =============================================================

    private String escapeJson(String value) {

        if (value == null) {
            return "";
        }

        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r");
    }
}