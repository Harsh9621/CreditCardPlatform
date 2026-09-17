package com.cardwise.cardwise.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "credit_cards",
        indexes = {
                @Index(name = "idx_card_bank", columnList = "bank"),
                @Index(name = "idx_card_type", columnList = "cardType")
        }
)
public class CreditCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 100)
    private String bank;

    @Column(nullable = false, length = 50)
    private String cardType;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal annualFee;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal joiningFee;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal cashbackPercentage;

    @Column(nullable = false, length = 100)
    private String rewardType;

    @Column(nullable = false, length = 1000)
    private String eligibility;

    @Column(length = 2000)
    private String benefits;

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public CreditCard() {
    }

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();

        if (createdAt == null) {
            createdAt = now;
        }

        if (updatedAt == null) {
            updatedAt = now;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getBank() {
        return bank;
    }

    public String getCardType() {
        return cardType;
    }

    public BigDecimal getAnnualFee() {
        return annualFee;
    }

    public BigDecimal getJoiningFee() {
        return joiningFee;
    }

    public BigDecimal getCashbackPercentage() {
        return cashbackPercentage;
    }

    public String getRewardType() {
        return rewardType;
    }

    public String getEligibility() {
        return eligibility;
    }

    public String getBenefits() {
        return benefits;
    }

    public boolean isActive() {
        return active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setBank(String bank) {
        this.bank = bank;
    }

    public void setCardType(String cardType) {
        this.cardType = cardType;
    }

    public void setAnnualFee(BigDecimal annualFee) {
        this.annualFee = annualFee;
    }

    public void setJoiningFee(BigDecimal joiningFee) {
        this.joiningFee = joiningFee;
    }

    public void setCashbackPercentage(BigDecimal cashbackPercentage) {
        this.cashbackPercentage = cashbackPercentage;
    }

    public void setRewardType(String rewardType) {
        this.rewardType = rewardType;
    }

    public void setEligibility(String eligibility) {
        this.eligibility = eligibility;
    }

    public void setBenefits(String benefits) {
        this.benefits = benefits;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}