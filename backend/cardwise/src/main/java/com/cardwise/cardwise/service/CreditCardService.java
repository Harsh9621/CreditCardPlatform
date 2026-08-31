package com.cardwise.cardwise.service;

import com.cardwise.cardwise.entity.CreditCard;
import com.cardwise.cardwise.repository.CreditCardRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CreditCardService {

    private final CreditCardRepository creditCardRepository;

    public CreditCardService(
            CreditCardRepository creditCardRepository) {

        this.creditCardRepository = creditCardRepository;
    }

    // Get all credit cards
    public List<CreditCard> getAllCards() {

        return creditCardRepository.findAll();
    }

    // Get credit card by ID
    public Optional<CreditCard> getCardById(Long id) {

        return creditCardRepository.findById(id);
    }

    // Add new credit card
    public CreditCard addCard(CreditCard creditCard) {

        return creditCardRepository.save(creditCard);
    }

    // Update credit card
    public CreditCard updateCard(
            Long id,
            CreditCard creditCard) {

        CreditCard existingCard =
                creditCardRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Credit card not found"
                                )
                        );

        existingCard.setName(creditCard.getName());
        existingCard.setBank(creditCard.getBank());
        existingCard.setCardType(creditCard.getCardType());
        existingCard.setAnnualFee(creditCard.getAnnualFee());
        existingCard.setJoiningFee(creditCard.getJoiningFee());
        existingCard.setCashbackPercentage(
                creditCard.getCashbackPercentage()
        );
        existingCard.setRewardType(
                creditCard.getRewardType()
        );
        existingCard.setEligibility(
                creditCard.getEligibility()
        );
        existingCard.setBenefits(
                creditCard.getBenefits()
        );

        return creditCardRepository.save(existingCard);
    }

    // Delete credit card
    public void deleteCard(Long id) {

        if (!creditCardRepository.existsById(id)) {
            throw new RuntimeException(
                    "Credit card not found"
            );
        }

        creditCardRepository.deleteById(id);
    }

    // Search cards by bank
    public List<CreditCard> getCardsByBank(
            String bank) {

        return creditCardRepository
                .findByBankIgnoreCase(bank);
    }

    // Search cards by card type
    public List<CreditCard> getCardsByType(
            String cardType) {

        return creditCardRepository
                .findByCardTypeIgnoreCase(cardType);
    }
}