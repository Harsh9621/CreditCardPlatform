package com.cardwise.cardwise.service;

import com.cardwise.cardwise.entity.User;
import com.cardwise.cardwise.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

private final UserRepository userRepository;
private final PasswordEncoder passwordEncoder;

public UserService(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder) {

    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
}

// REGISTER USER
public User registerUser(User user) {

    if (user.getName() == null || user.getName().isBlank()) {
        throw new RuntimeException("Name is required");
    }

    if (user.getEmail() == null || user.getEmail().isBlank()) {
        throw new RuntimeException("Email is required");
    }

    if (user.getPassword() == null || user.getPassword().isBlank()) {
        throw new RuntimeException("Password is required");
    }

    String email = user.getEmail().trim().toLowerCase();

    if (userRepository.existsByEmail(email)) {
        throw new RuntimeException("Email already registered");
    }

    user.setEmail(email);

    // Never trust role from frontend
    user.setRole("USER");

    // Hash password
    user.setPassword(
            passwordEncoder.encode(user.getPassword())
    );

    // New account is active
    user.setActive(true);

    return userRepository.save(user);
}

// FIND BY EMAIL
public User findByEmail(String email) {

    if (email == null || email.isBlank()) {
        throw new RuntimeException("Email is required");
    }

    return userRepository
            .findByEmail(email.trim().toLowerCase())
            .orElseThrow(() ->
                    new RuntimeException("User not found"));
}

// FIND BY ID
public User findById(Long id) {

    if (id == null) {
        throw new RuntimeException("User ID is required");
    }

    return userRepository
            .findById(id)
            .orElseThrow(() ->
                    new RuntimeException("User not found"));
}

// GET ALL USERS
public List<User> getAllUsers() {
    return userRepository.findAllByOrderByIdDesc();
}

// UPDATE PROFILE
public User updateProfile(Long id, User updatedUser) {

    User user = findById(id);

    if (updatedUser.getName() != null &&
            !updatedUser.getName().isBlank()) {

        user.setName(updatedUser.getName().trim());
    }

    if (updatedUser.getPhone() != null) {
        user.setPhone(updatedUser.getPhone().trim());
    }

    if (updatedUser.getAddress() != null) {
        user.setAddress(updatedUser.getAddress().trim());
    }

    if (updatedUser.getCity() != null) {
        user.setCity(updatedUser.getCity().trim());
    }

    if (updatedUser.getState() != null) {
        user.setState(updatedUser.getState().trim());
    }

    if (updatedUser.getPincode() != null) {
        user.setPincode(updatedUser.getPincode().trim());
    }

    return userRepository.save(user);
}

// ADMIN BLOCK USER
public User blockUser(Long id) {

    User user = findById(id);

    if ("ADMIN".equalsIgnoreCase(user.getRole())) {
        throw new RuntimeException(
                "Administrator cannot be blocked");
    }

    user.setActive(false);

    return userRepository.save(user);
}

// ADMIN UNBLOCK USER
public User unblockUser(Long id) {

    User user = findById(id);

    user.setActive(true);

    return userRepository.save(user);
}

// CHECK PASSWORD
public boolean checkPassword(
        String rawPassword,
        String encodedPassword) {

    if (rawPassword == null || rawPassword.isBlank()) {
        return false;
    }

    if (encodedPassword == null || encodedPassword.isBlank()) {
        return false;
    }

    return passwordEncoder.matches(
            rawPassword,
            encodedPassword
    );
}

// RESET ADMIN PASSWORD
public void resetAdminPassword() {

    User admin = userRepository
            .findByEmail("admin@cardwise.com")
            .orElseThrow(() ->
                    new RuntimeException("Admin user not found"));

    admin.setPassword(
            passwordEncoder.encode("Admin@123")
    );

    admin.setRole("ADMIN");
    admin.setActive(true);

    userRepository.save(admin);
}

// TEST ADMIN PASSWORD
public boolean testAdminPassword() {

    User admin = userRepository
            .findByEmail("admin@cardwise.com")
            .orElseThrow(() ->
                    new RuntimeException("Admin user not found"));

    return passwordEncoder.matches(
            "Admin@123",
            admin.getPassword()
    );
}

}
