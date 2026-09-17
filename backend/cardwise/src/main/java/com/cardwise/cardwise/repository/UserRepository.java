package com.cardwise.cardwise.repository;

import com.cardwise.cardwise.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // =====================================================
    // EMAIL
    // =====================================================

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    // =====================================================
    // PHONE
    // =====================================================

    Optional<User> findByPhone(String phone);

    boolean existsByPhone(String phone);

    // =====================================================
    // ADMIN / USERS
    // =====================================================

    List<User> findAllByOrderByIdDesc();
}