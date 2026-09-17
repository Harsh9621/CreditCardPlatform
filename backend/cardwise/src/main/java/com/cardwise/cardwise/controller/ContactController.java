package com.cardwise.cardwise.controller;

import com.cardwise.cardwise.entity.ContactMessage;
import com.cardwise.cardwise.entity.enums.ContactStatus;
import com.cardwise.cardwise.repository.ContactMessageRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private final ContactMessageRepository contactMessageRepository;

    public ContactController(
            ContactMessageRepository contactMessageRepository) {

        this.contactMessageRepository =
                contactMessageRepository;
    }

    @PostMapping
    public ResponseEntity<?> submitMessage(
            @RequestBody ContactMessage contactMessage) {

        if (contactMessage.getName() == null ||
                contactMessage.getName().isBlank()) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Name is required."
                    ));
        }

        if (contactMessage.getEmail() == null ||
                contactMessage.getEmail().isBlank()) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Email is required."
                    ));
        }

        if (contactMessage.getSubject() == null ||
                contactMessage.getSubject().isBlank()) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Subject is required."
                    ));
        }

        if (contactMessage.getMessage() == null ||
                contactMessage.getMessage().isBlank()) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Message is required."
                    ));
        }

        contactMessage.setId(null);

        contactMessage.setStatus(
                ContactStatus.UNREAD
        );

        contactMessage.setCreatedAt(null);

        ContactMessage saved =
                contactMessageRepository.save(
                        contactMessage
                );

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Your message has been sent successfully.",
                        "id",
                        saved.getId()
                )
        );
    }
}