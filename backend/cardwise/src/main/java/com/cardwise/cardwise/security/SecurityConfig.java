package com.cardwise.cardwise.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.http.HttpServletResponse;

import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter) {

        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    // =====================================================
    // SECURITY FILTER CHAIN
    // =====================================================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http

                // =================================================
                // CORS
                // =================================================

                .cors(cors -> cors
                        .configurationSource(corsConfigurationSource())
                )

                // =================================================
                // CSRF
                // =================================================

                .csrf(csrf -> csrf.disable())

                // =================================================
                // SESSION
                // =================================================

                .sessionManagement(session -> session
                        .sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                // =================================================
                // EXCEPTION HANDLING
                // =================================================

                .exceptionHandling(exception -> exception

                        .authenticationEntryPoint(
                                authenticationEntryPoint()
                        )

                        .accessDeniedHandler(
                                accessDeniedHandler()
                        )
                )

                // =================================================
                // AUTHORIZATION
                // =================================================

                .authorizeHttpRequests(auth -> auth

                        // -------------------------------------------------
                        // PUBLIC ENDPOINTS
                        // -------------------------------------------------

                        .requestMatchers(
                                "/",
                                "/error",
                                "/api/auth/**"
                        ).permitAll()

                        // -------------------------------------------------
                        // ADMIN APPLICATIONS
                        // -------------------------------------------------

                        .requestMatchers(
                                "/api/admin/applications/**"
                        ).hasRole("ADMIN")

                        // -------------------------------------------------
                        // ADMIN USERS
                        // -------------------------------------------------

                        .requestMatchers(
                                "/api/admin/users/**"
                        ).hasRole("ADMIN")

                        // -------------------------------------------------
                        // OTHER ADMIN APIs
                        // -------------------------------------------------

                        .requestMatchers(
                                "/api/admin/**"
                        ).hasRole("ADMIN")

                        // -------------------------------------------------
                        // VIEW CARDS
                        // -------------------------------------------------

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/cards/**"
                        ).authenticated()

                        // -------------------------------------------------
                        // CREATE CARDS
                        // -------------------------------------------------

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/cards/**"
                        ).hasRole("ADMIN")

                        // -------------------------------------------------
                        // UPDATE CARDS
                        // -------------------------------------------------

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/cards/**"
                        ).hasRole("ADMIN")

                        // -------------------------------------------------
                        // DELETE CARDS
                        // -------------------------------------------------

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/cards/**"
                        ).hasRole("ADMIN")

                        // -------------------------------------------------
                        // USER APPLICATIONS
                        // -------------------------------------------------

                        .requestMatchers(
                                "/api/applications/**"
                        ).authenticated()

                        // -------------------------------------------------
                        // EVERYTHING ELSE
                        // -------------------------------------------------

                        .anyRequest().authenticated()
                )

                // =================================================
                // JWT FILTER
                // =================================================

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    // =====================================================
    // 401 - AUTHENTICATION ENTRY POINT
    // =====================================================

    @Bean
    public AuthenticationEntryPoint authenticationEntryPoint() {

        return (request, response, authException) -> {

            response.setStatus(
                    HttpServletResponse.SC_UNAUTHORIZED
            );

            response.setContentType(
                    "application/json"
            );

            response.getWriter().write(
                    "{\"message\":\"Authentication required\"}"
            );
        };
    }

    // =====================================================
    // 403 - ACCESS DENIED
    // =====================================================

    @Bean
    public AccessDeniedHandler accessDeniedHandler() {

        return (request, response, accessDeniedException) -> {

            System.out.println(
                    "ACCESS DENIED: "
                            + request.getMethod()
                            + " "
                            + request.getRequestURI()
            );

            response.setStatus(
                    HttpServletResponse.SC_FORBIDDEN
            );

            response.setContentType(
                    "application/json"
            );

            response.getWriter().write(
                    "{\"message\":\"Access denied. Administrator privileges required.\"}"
            );
        };
    }

    // =====================================================
    // CORS CONFIGURATION
    // =====================================================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of(
                        // Local Vite development
                        "http://localhost:5173",

                        // Production Vercel frontend
                        "https://credit-card-platform-boopzmv9k-coder-2451.vercel.app"
                )
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "PATCH",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of(
                        "Authorization",
                        "Content-Type",
                        "Accept",
                        "Origin",
                        "X-Requested-With"
                )
        );

        configuration.setExposedHeaders(
                List.of(
                        "Authorization"
                )
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}
