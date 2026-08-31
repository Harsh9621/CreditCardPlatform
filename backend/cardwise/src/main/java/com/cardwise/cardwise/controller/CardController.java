package com.cardwise.cardwise.controller;

import com.cardwise.cardwise.entity.CreditCard;
import com.cardwise.cardwise.service.CreditCardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cards")
@CrossOrigin(origins = "http://localhost:5173")
public class CardController {

    private final CreditCardService creditCardService;

    public CardController(CreditCardService creditCardService) {
        this.creditCardService = creditCardService;
    }

    // Get all credit cards
    @GetMapping
    public ResponseEntity<List<CreditCard>> getAllCards() {

        return ResponseEntity.ok(
                creditCardService.getAllCards()
        );
    }

    // Get credit card by ID
    @GetMapping("/{id}")
    public ResponseEntity<CreditCard> getCardById(
            @PathVariable Long id) {

        return creditCardService.getCardById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Add new credit card
    @PostMapping
    public ResponseEntity<CreditCard> addCard(
            @RequestBody CreditCard creditCard) {

        return ResponseEntity.ok(
                creditCardService.addCard(creditCard)
        );
    }

    // Update credit card
    @PutMapping("/{id}")
    public ResponseEntity<CreditCard> updateCard(
            @PathVariable Long id,
            @RequestBody CreditCard creditCard) {

        return ResponseEntity.ok(
                creditCardService.updateCard(id, creditCard)
        );
    }

    // Delete credit card
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCard(
            @PathVariable Long id) {

        creditCardService.deleteCard(id);

        return ResponseEntity.noContent().build();
    }

    // Find cards by bank
    @GetMapping("/bank/{bank}")
    public ResponseEntity<List<CreditCard>> getCardsByBank(
            @PathVariable String bank) {

        return ResponseEntity.ok(
                creditCardService.getCardsByBank(bank)
        );
    }

    // Find cards by type
    @GetMapping("/type/{cardType}")
    public ResponseEntity<List<CreditCard>> getCardsByType(
            @PathVariable String cardType) {

        return ResponseEntity.ok(
                creditCardService.getCardsByType(cardType)
        );
    }

    // Protected JWT test endpoint
    @GetMapping("/protected")
    public ResponseEntity<String> protectedEndpoint(
            Authentication authentication) {

        return ResponseEntity.ok(
                "Authenticated successfully as: "
                        + authentication.getName()
        );
    }
}