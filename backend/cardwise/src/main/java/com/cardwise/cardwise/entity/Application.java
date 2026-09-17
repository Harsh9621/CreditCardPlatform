package com.cardwise.cardwise.entity;

import com.cardwise.cardwise.entity.enums.ApplicationStatus;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "applications",
        indexes = {
                @Index(
                        name = "idx_application_user",
                        columnList = "user_id"
                ),
                @Index(
                        name = "idx_application_card",
                        columnList = "credit_card_id"
                ),
                @Index(
                        name = "idx_application_status",
                        columnList = "status"
                ),
                @Index(
                        name = "idx_application_applied",
                        columnList = "appliedAt"
                )
        }
)
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =====================================================
    // USER
    // =====================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;

    // =====================================================
    // CREDIT CARD
    // =====================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "credit_card_id",
            nullable = false
    )
    private CreditCard creditCard;

    // =====================================================
    // STATUS
    // =====================================================

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 20
    )
    private ApplicationStatus status = ApplicationStatus.PENDING;

    // =====================================================
    // APPLICATION DATE
    // =====================================================

    @Column(nullable = false)
    private LocalDateTime appliedAt;

    // =====================================================
    // REVIEW INFORMATION
    // =====================================================

    private LocalDateTime reviewedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    @Column(length = 1000)
    private String reviewReason;

    // =====================================================
    // AUDIT DATES
    // =====================================================

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // =====================================================
    // CONSTRUCTORS
    // =====================================================

    public Application() {
    }

    public Application(
            User user,
            CreditCard creditCard,
            ApplicationStatus status,
            LocalDateTime appliedAt
    ) {
        this.user = user;
        this.creditCard = creditCard;
        this.status = status;
        this.appliedAt = appliedAt;
    }

    // =====================================================
    // PRE PERSIST
    // =====================================================

    @PrePersist
    protected void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        if (createdAt == null) {
            createdAt = now;
        }

        if (updatedAt == null) {
            updatedAt = now;
        }

        if (appliedAt == null) {
            appliedAt = now;
        }

        if (status == null) {
            status = ApplicationStatus.PENDING;
        }
    }

    // =====================================================
    // PRE UPDATE
    // =====================================================

    @PreUpdate
    protected void onUpdate() {

        LocalDateTime now = LocalDateTime.now();

        /*
         * Important:
         * Older application records may have been created before
         * createdAt was introduced. Repair the value automatically
         * when an old application is updated.
         */

        if (createdAt == null) {
            createdAt = now;
        }

        if (updatedAt == null) {
            updatedAt = now;
        } else {
            updatedAt = now;
        }
    }

    // =====================================================
    // GETTERS
    // =====================================================

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public CreditCard getCreditCard() {
        return creditCard;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public LocalDateTime getAppliedAt() {
        return appliedAt;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public User getReviewedBy() {
        return reviewedBy;
    }

    public String getReviewReason() {
        return reviewReason;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    // =====================================================
    // SETTERS
    // =====================================================

    public void setId(Long id) {
        this.id = id;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setCreditCard(CreditCard creditCard) {
        this.creditCard = creditCard;
    }

    public void setStatus(ApplicationStatus status) {
        this.status = status;
    }

    public void setAppliedAt(LocalDateTime appliedAt) {
        this.appliedAt = appliedAt;
    }

    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }

    public void setReviewedBy(User reviewedBy) {
        this.reviewedBy = reviewedBy;
    }

    public void setReviewReason(String reviewReason) {
        this.reviewReason = reviewReason;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}