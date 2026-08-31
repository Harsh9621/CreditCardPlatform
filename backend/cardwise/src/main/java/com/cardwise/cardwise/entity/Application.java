package com.cardwise.cardwise.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "applications")
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(
            name = "credit_card_id",
            nullable = false
    )
    private CreditCard creditCard;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private LocalDateTime appliedAt;

    public Application() {
    }

    public Application(
            User user,
            CreditCard creditCard,
            String status,
            LocalDateTime appliedAt) {

        this.user = user;
        this.creditCard = creditCard;
        this.status = status;
        this.appliedAt = appliedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public CreditCard getCreditCard() {
        return creditCard;
    }

    public void setCreditCard(CreditCard creditCard) {
        this.creditCard = creditCard;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getAppliedAt() {
        return appliedAt;
    }

    public void setAppliedAt(LocalDateTime appliedAt) {
        this.appliedAt = appliedAt;
    }
}