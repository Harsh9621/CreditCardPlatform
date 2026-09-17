package com.cardwise.cardwise.repository;

import com.cardwise.cardwise.entity.ContactMessage;
import com.cardwise.cardwise.entity.enums.ContactStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContactMessageRepository
        extends JpaRepository<ContactMessage, Long> {

    List<ContactMessage> findAllByOrderByCreatedAtDesc();

    long countByStatus(ContactStatus status);
}