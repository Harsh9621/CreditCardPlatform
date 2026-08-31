package com.cardwise.cardwise.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

@Entity
@Table(
    name = "users",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_users_email",
            columnNames = "email"
        )
    }
)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =====================================================
    // BASIC DETAILS
    // =====================================================

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(length = 20)
    private String phone;

    // =====================================================
    // PROFILE DETAILS
    // =====================================================

    @Column(length = 255)
    private String address;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String state;

    @Column(length = 10)
    private String pincode;

    // =====================================================
    // PASSWORD
    // =====================================================

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    // =====================================================
    // ROLE
    // =====================================================

    @Column(nullable = false, length = 20)
    private String role = "USER";

    // =====================================================
    // ACCOUNT STATUS
    // =====================================================

    @Column(nullable = false)
    private boolean active = true;

    // =====================================================
    // CONSTRUCTORS
    // =====================================================

    public User() {
    }

    public User(
            String name,
            String email,
            String phone,
            String password,
            String role
    ) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.password = password;
        this.role = role;
        this.active = true;
    }

    // =====================================================
    // GETTERS
    // =====================================================

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getAddress() {
        return address;
    }

    public String getCity() {
        return city;
    }

    public String getState() {
        return state;
    }

    public String getPincode() {
        return pincode;
    }

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    public String getPassword() {
        return password;
    }

    public String getRole() {
        return role;
    }

    public boolean isActive() {
        return active;
    }

    // =====================================================
    // SETTERS
    // =====================================================

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public void setState(String state) {
        this.state = state;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
