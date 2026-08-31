package com.cardwise.cardwise.repository;

import com.cardwise.cardwise.entity.CreditCard;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CreditCardRepository extends JpaRepository<CreditCard, Long> {

    List<CreditCard> findByBankIgnoreCase(String bank);

    List<CreditCard> findByCardTypeIgnoreCase(String cardType);
}