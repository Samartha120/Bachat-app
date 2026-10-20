package com.shrestha.bachat.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "transactions",
    indexes = {
        @Index(name = "idx_trx_date", columnList = "transactionDate"),
        @Index(name = "idx_trx_due_date", columnList = "dueDate"),
        @Index(name = "idx_trx_status", columnList = "status"),
        @Index(name = "idx_trx_type", columnList = "type")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Strictly using BigDecimal with precision 19, scale 2 to guarantee zero rounding errors.
     */
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TransactionType type;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(nullable = false)
    private LocalDate transactionDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TransactionStatus status;

    private LocalDate dueDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @Column(length = 500)
    private String notes;

    @Column(length = 100)
    private String paymentReference;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    private User createdBy;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        checkAndUpdateOverdue();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        checkAndUpdateOverdue();
    }

    /**
     * Automatic overdue detection: if status is PENDING and dueDate is in the past.
     */
    public void checkAndUpdateOverdue() {
        if (this.status == TransactionStatus.PENDING && this.dueDate != null && this.dueDate.isBefore(LocalDate.now())) {
            this.status = TransactionStatus.OVERDUE;
        }
    }
}
