package com.cardwise.cardwise.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "credit_cards")
public class CreditCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String bank;

    @Column(nullable = false)
    private String cardType;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal annualFee;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal joiningFee;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal cashbackPercentage;

    @Column(nullable = false)
    private String rewardType;

    @Column(nullable = false)
    private String eligibility;

    @Column(length = 1000)
    private String benefits;

    public CreditCard() {
    }

    public CreditCard(
            String name,
            String bank,
            String cardType,
            BigDecimal annualFee,
            BigDecimal joiningFee,
            BigDecimal cashbackPercentage,
            String rewardType,
            String eligibility,
            String benefits) {

        this.name = name;
        this.bank = bank;
        this.cardType = cardType;
        this.annualFee = annualFee;
        this.joiningFee = joiningFee;
        this.cashbackPercentage = cashbackPercentage;
        this.rewardType = rewardType;
        this.eligibility = eligibility;
        this.benefits = benefits;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBank() {
        return bank;
    }

    public void setBank(String bank) {
        this.bank = bank;
    }

    public String getCardType() {
        return cardType;
    }

    public void setCardType(String cardType) {
        this.cardType = cardType;
    }

    public BigDecimal getAnnualFee() {
        return annualFee;
    }

    public void setAnnualFee(BigDecimal annualFee) {
        this.annualFee = annualFee;
    }

    public BigDecimal getJoiningFee() {
        return joiningFee;
    }

    public void setJoiningFee(BigDecimal joiningFee) {
        this.joiningFee = joiningFee;
    }

    public BigDecimal getCashbackPercentage() {
        return cashbackPercentage;
    }

    public void setCashbackPercentage(BigDecimal cashbackPercentage) {
        this.cashbackPercentage = cashbackPercentage;
    }

    public String getRewardType() {
        return rewardType;
    }

    public void setRewardType(String rewardType) {
        this.rewardType = rewardType;
    }

    public String getEligibility() {
        return eligibility;
    }

    public void setEligibility(String eligibility) {
        this.eligibility = eligibility;
    }

    public String getBenefits() {
        return benefits;
    }

    public void setBenefits(String benefits) {
        this.benefits = benefits;
    }
}