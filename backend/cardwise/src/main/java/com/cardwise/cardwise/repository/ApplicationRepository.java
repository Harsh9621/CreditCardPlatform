package com.cardwise.cardwise.repository;

import com.cardwise.cardwise.entity.Application;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApplicationRepository
        extends JpaRepository<Application, Long> {

    // =====================================================
    // GET ALL APPLICATIONS
    // =====================================================

    List<Application>
    findAllByOrderByAppliedAtDesc();


    // =====================================================
    // GET USER APPLICATIONS
    // =====================================================

    List<Application>
    findByUserIdOrderByAppliedAtDesc(
            Long userId
    );


    // =====================================================
    // GET APPLICATIONS BY CREDIT CARD
    // =====================================================

    List<Application>
    findByCreditCardIdOrderByAppliedAtDesc(
            Long creditCardId
    );


    // =====================================================
    // GET APPLICATIONS BY STATUS
    // =====================================================

    List<Application>
    findByStatusIgnoreCaseOrderByAppliedAtDesc(
            String status
    );


    // =====================================================
    // GET LATEST APPLICATION
    // =====================================================

    Application
    findFirstByUserIdAndCreditCardIdOrderByAppliedAtDesc(
            Long userId,
            Long creditCardId
    );
}