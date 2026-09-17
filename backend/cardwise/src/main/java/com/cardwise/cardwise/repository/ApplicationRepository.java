package com.cardwise.cardwise.repository;

import com.cardwise.cardwise.entity.Application;
import com.cardwise.cardwise.entity.enums.ApplicationStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApplicationRepository
        extends JpaRepository<Application, Long> {

    @EntityGraph(attributePaths = {
            "user",
            "creditCard",
            "reviewedBy"
    })
    List<Application> findAllByOrderByAppliedAtDesc();

    @EntityGraph(attributePaths = {
            "user",
            "creditCard",
            "reviewedBy"
    })
    List<Application> findByUserIdOrderByAppliedAtDesc(
            Long userId
    );

    @EntityGraph(attributePaths = {
            "user",
            "creditCard",
            "reviewedBy"
    })
    List<Application> findByCreditCardIdOrderByAppliedAtDesc(
            Long creditCardId
    );

    @EntityGraph(attributePaths = {
            "user",
            "creditCard",
            "reviewedBy"
    })
    List<Application> findByStatusOrderByAppliedAtDesc(
            ApplicationStatus status
    );

    @EntityGraph(attributePaths = {
            "user",
            "creditCard",
            "reviewedBy"
    })
    Application findFirstByUserIdAndCreditCardIdOrderByAppliedAtDesc(
            Long userId,
            Long creditCardId
    );
}