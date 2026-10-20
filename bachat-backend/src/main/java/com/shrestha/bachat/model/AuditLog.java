package com.shrestha.bachat.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "audit_logs",
    indexes = {
        @Index(name = "idx_audit_timestamp", columnList = "timestamp"),
        @Index(name = "idx_audit_username", columnList = "username")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false, length = 100)
    private String username;

    @Column(nullable = false, length = 50)
    private String action; // e.g., TRANSACTION_CREATE, TRANSACTION_UPDATE, TRANSACTION_DELETE, CUSTOMER_DEACTIVATE

    @Column(length = 50)
    private String ipAddress;

    @Column(length = 100)
    private String targetEntity; // e.g., Transaction#42, Customer#12

    @Column(length = 1000)
    private String details;
}
