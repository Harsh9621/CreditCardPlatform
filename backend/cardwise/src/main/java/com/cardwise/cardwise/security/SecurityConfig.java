package com.cardwise.cardwise.security;

import java.util.List;

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

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
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
                        // CORS PREFLIGHT REQUESTS
                        // -------------------------------------------------

                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        ).permitAll()

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
                // JWT AUTHENTICATION FILTER
                // =================================================

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    // =====================================================
    // 401 - UNAUTHORIZED
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

            response.setCharacterEncoding("UTF-8");

            response.getWriter().write(
                    "{\"message\":\"Authentication required\"}"
            );
        };
    }

    // =====================================================
    // 403 - FORBIDDEN
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

            response.setCharacterEncoding("UTF-8");

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

        // -------------------------------------------------
        // ALLOWED FRONTENDS
        // -------------------------------------------------

        configuration.setAllowedOrigins(
                List.of(
                        // Local Vite frontend
                        "http://localhost:5173",

                        // Production Vercel frontend
                        "https://credit-card-platform-silk.vercel.app"
                )
        );

        // -------------------------------------------------
        // ALLOWED HTTP METHODS
        // -------------------------------------------------

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

        // -------------------------------------------------
        // ALLOWED HEADERS
        // -------------------------------------------------

        configuration.setAllowedHeaders(
                List.of(
                        "Authorization",
                        "Content-Type",
                        "Accept",
                        "Origin",
                        "X-Requested-With"
                )
        );

        // -------------------------------------------------
        // EXPOSED HEADERS
        // -------------------------------------------------

        configuration.setExposedHeaders(
                List.of(
                        "Authorization"
                )
        );

        // -------------------------------------------------
        // CREDENTIALS
        // -------------------------------------------------

        configuration.setAllowCredentials(true);

        // -------------------------------------------------
        // APPLY CORS TO ALL ENDPOINTS
        // -------------------------------------------------

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}
