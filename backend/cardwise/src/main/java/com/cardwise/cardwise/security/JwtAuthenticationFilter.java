package com.cardwise.cardwise.security;

import com.cardwise.cardwise.entity.User;
import com.cardwise.cardwise.service.JwtService;
import com.cardwise.cardwise.service.UserService;

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
            UserService userService) {

        this.jwtService = jwtService;
        this.userService = userService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader =
                request.getHeader("Authorization");

        // =====================================================
        // NO JWT
        // =====================================================

        if (authHeader == null ||
                !authHeader.startsWith("Bearer ")) {

            filterChain.doFilter(request, response);
            return;
        }

        String token =
                authHeader.substring(7).trim();

        // =====================================================
        // EMPTY TOKEN
        // =====================================================

        if (token.isEmpty()) {

            filterChain.doFilter(request, response);
            return;
        }

        try {

            // =================================================
            // EXTRACT EMAIL
            // =================================================

            String email =
                    jwtService.extractEmail(token);

            if (email == null ||
                    email.isBlank()) {

                filterChain.doFilter(request, response);
                return;
            }

            // =================================================
            // DON'T AUTHENTICATE TWICE
            // =================================================

            if (SecurityContextHolder
                    .getContext()
                    .getAuthentication() == null) {

                // =============================================
                // FIND USER
                // =============================================

                User user =
                        userService.findByEmail(email);

                // =============================================
                // CHECK ACTIVE ACCOUNT
                // =============================================

                if (!user.isActive()) {

                    response.setStatus(
                            HttpServletResponse.SC_FORBIDDEN
                    );

                    response.setContentType(
                            "application/json"
                    );

                    response.getWriter().write(
                            "{\"message\":\"Your account is inactive.\"}"
                    );

                    return;
                }

                // =============================================
                // GET ROLE
                // =============================================

                String role = user.getRole();

                if (role == null ||
                        role.isBlank()) {

                    response.setStatus(
                            HttpServletResponse.SC_FORBIDDEN
                    );

                    response.setContentType(
                            "application/json"
                    );

                    response.getWriter().write(
                            "{\"message\":\"User role is not configured.\"}"
                    );

                    return;
                }

                role =
                        role.trim()
                            .toUpperCase();

                // =============================================
                // CREATE AUTHORITY
                // =============================================

                List<SimpleGrantedAuthority> authorities =
                        List.of(
                                new SimpleGrantedAuthority(
                                        "ROLE_" + role
                                )
                        );

                // =============================================
                // CREATE AUTHENTICATION
                // =============================================

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                user.getEmail(),
                                null,
                                authorities
                        );

                // =============================================
                // SET SECURITY CONTEXT
                // =============================================

                SecurityContextHolder
                        .getContext()
                        .setAuthentication(
                                authentication
                        );

                System.out.println(
                        "JWT authenticated: "
                                + user.getEmail()
                                + " | ROLE_"
                                + role
                );
            }

        } catch (Exception e) {

            System.out.println(
                    "JWT authentication failed: "
                            + e.getMessage()
            );

            response.setStatus(
                    HttpServletResponse.SC_UNAUTHORIZED
            );

            response.setContentType(
                    "application/json"
            );

            response.getWriter().write(
                    "{\"message\":\"Invalid or expired token\"}"
            );

            return;
        }

        filterChain.doFilter(
                request,
                response
        );
    }
}