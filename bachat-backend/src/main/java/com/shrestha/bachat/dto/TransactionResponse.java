package com.shrestha.bachat.dto;

import com.shrestha.bachat.model.TransactionStatus;
import com.shrestha.bachat.model.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {
    private Long id;
    private BigDecimal amount;
    private String formattedAmount;
    private TransactionType type;
    private String category;
    private LocalDate transactionDate;
    private TransactionStatus status;
    private LocalDate dueDate;
    private Long daysOverdue;
    private Long customerId;
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private String notes;
    private String paymentReference;
    private String createdByUsername;
    private LocalDateTime createdAt;
}
