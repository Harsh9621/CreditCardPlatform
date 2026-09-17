package com.cardwise.cardwise.controller;

import com.cardwise.cardwise.entity.ContactMessage;
import com.cardwise.cardwise.entity.enums.ContactStatus;
import com.cardwise.cardwise.repository.ContactMessageRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/contact")
public class AdminContactController {

    private final ContactMessageRepository contactMessageRepository;

    public AdminContactController(
            ContactMessageRepository contactMessageRepository) {

        this.contactMessageRepository =
                contactMessageRepository;
    }

    // =====================================================
    // GET ALL CONTACT MESSAGES
    // =====================================================

    @GetMapping
    public ResponseEntity<List<ContactMessage>>
    getAllMessages() {

        return ResponseEntity.ok(
                contactMessageRepository
                        .findAllByOrderByCreatedAtDesc()
        );
    }

    // =====================================================
    // GET UNREAD COUNT
    // =====================================================

    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount() {

        long count =
                contactMessageRepository
                        .countByStatus(
                                ContactStatus.UNREAD
                        );

        return ResponseEntity.ok(
                Map.of("count", count)
        );
    }

    // =====================================================
    // MARK AS READ
    // =====================================================

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(
            @PathVariable Long id) {

        return contactMessageRepository
                .findById(id)
                .map(contactMessage -> {

                    contactMessage.setStatus(
                            ContactStatus.READ
                    );

                    ContactMessage updated =
                            contactMessageRepository
                                    .save(contactMessage);

                    return ResponseEntity.ok(updated);
                })
                .orElseGet(() ->
                        ResponseEntity
                                .notFound()
                                .build()
                );
    }

    // =====================================================
    // DELETE MESSAGE
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMessage(
            @PathVariable Long id) {

        if (!contactMessageRepository
                .existsById(id)) {

            return ResponseEntity
                    .notFound()
                    .build();
        }

        contactMessageRepository.deleteById(id);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Contact message deleted successfully."
                )
        );
    }
}