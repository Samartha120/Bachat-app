package com.shrestha.bachat.dto;

import com.shrestha.bachat.model.TransactionStatus;
import com.shrestha.bachat.model.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionRequest {

    @NotNull(message = "Amount is strictly required")
    @DecimalMin(value = "0.01", inclusive = true, message = "Amount must be strictly greater than 0")
    private BigDecimal amount;

    @NotNull(message = "Transaction type is required (INCOME or EXPENSE)")
    private TransactionType type;

    @NotBlank(message = "Category is required")
    @Size(max = 100, message = "Category name must not exceed 100 characters")
    private String category;

    @NotNull(message = "Transaction date is required")
    private LocalDate transactionDate;

    @NotNull(message = "Transaction status is required (PAID or PENDING)")
    private TransactionStatus status;

    private LocalDate dueDate;

    private Long customerId;

    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;

    @Size(max = 100, message = "Payment reference must not exceed 100 characters")
    private String paymentReference;
}
