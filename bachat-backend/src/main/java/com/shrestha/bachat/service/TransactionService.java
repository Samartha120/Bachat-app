package com.shrestha.bachat.service;

import com.shrestha.bachat.dto.TransactionRequest;
import com.shrestha.bachat.dto.TransactionResponse;
import com.shrestha.bachat.exception.ResourceNotFoundException;
import com.shrestha.bachat.model.*;
import com.shrestha.bachat.repository.CustomerRepository;
import com.shrestha.bachat.repository.TransactionRepository;
import com.shrestha.bachat.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    @Transactional
    public TransactionResponse createTransaction(TransactionRequest request, String currentUsername) {
        User user = userRepository.findByUsername(currentUsername).orElse(null);

        Customer customer = null;
        if (request.getCustomerId() != null) {
            customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + request.getCustomerId()));
        }

        // Exact financial BigDecimal precision (2 decimal places, HALF_UP rounding)
        BigDecimal validatedAmount = request.getAmount().setScale(2, RoundingMode.HALF_UP);

        TransactionStatus initialStatus = request.getStatus();
        LocalDate now = LocalDate.now();
        if (initialStatus == TransactionStatus.PENDING && request.getDueDate() != null && request.getDueDate().isBefore(now)) {
            initialStatus = TransactionStatus.OVERDUE;
        }

        Transaction transaction = Transaction.builder()
                .amount(validatedAmount)
                .type(request.getType())
                .category(request.getCategory().trim())
                .transactionDate(request.getTransactionDate())
                .status(initialStatus)
                .dueDate(request.getDueDate())
                .customer(customer)
                .notes(request.getNotes() != null ? request.getNotes().trim() : null)
                .paymentReference(request.getPaymentReference() != null ? request.getPaymentReference().trim() : null)
                .createdBy(user)
                .build();

        Transaction saved = transactionRepository.save(transaction);

        auditLogService.recordAction(
                currentUsername,
                "TRANSACTION_CREATE",
                "Transaction#" + saved.getId(),
                String.format("Created %s of NPR %s in category '%s'", saved.getType(), saved.getAmount(), saved.getCategory())
        );

        return mapToResponse(saved);
    }

    @Transactional
    public TransactionResponse updateTransaction(Long id, TransactionRequest request, String currentUsername) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));

        Customer customer = null;
        if (request.getCustomerId() != null) {
            customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + request.getCustomerId()));
        }

        BigDecimal validatedAmount = request.getAmount().setScale(2, RoundingMode.HALF_UP);

        transaction.setAmount(validatedAmount);
        transaction.setType(request.getType());
        transaction.setCategory(request.getCategory().trim());
        transaction.setTransactionDate(request.getTransactionDate());
        transaction.setStatus(request.getStatus());
        transaction.setDueDate(request.getDueDate());
        transaction.setCustomer(customer);
        transaction.setNotes(request.getNotes() != null ? request.getNotes().trim() : null);
        transaction.setPaymentReference(request.getPaymentReference() != null ? request.getPaymentReference().trim() : null);

        // Check overdue condition
        transaction.checkAndUpdateOverdue();

        Transaction updated = transactionRepository.save(transaction);

        auditLogService.recordAction(
                currentUsername,
                "TRANSACTION_UPDATE",
                "Transaction#" + updated.getId(),
                String.format("Updated transaction to %s NPR %s", updated.getType(), updated.getAmount())
        );

        return mapToResponse(updated);
    }

    @Transactional
    public TransactionResponse markAsPaid(Long id, String currentUsername) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));

        TransactionStatus previousStatus = transaction.getStatus();
        transaction.setStatus(TransactionStatus.PAID);
        Transaction saved = transactionRepository.save(transaction);

        auditLogService.recordAction(
                currentUsername,
                "TRANSACTION_STATUS_PAID",
                "Transaction#" + saved.getId(),
                String.format("Marked as PAID (previously %s) for amount NPR %s", previousStatus, saved.getAmount())
        );

        return mapToResponse(saved);
    }

    @Transactional
    public void deleteTransaction(Long id, String currentUsername) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));

        transactionRepository.delete(transaction);

        auditLogService.recordAction(
                currentUsername,
                "TRANSACTION_DELETE",
                "Transaction#" + id,
                String.format("Deleted %s transaction of NPR %s", transaction.getType(), transaction.getAmount())
        );
    }

    @Transactional(readOnly = true)
    public TransactionResponse getTransactionById(Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));
        return mapToResponse(transaction);
    }

    @Transactional(readOnly = true)
    public Page<TransactionResponse> getTransactions(Pageable pageable) {
        return transactionRepository.findAllByOrderByTransactionDateDescCreatedAtDesc(pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getRecentTransactions() {
        return transactionRepository.findAllByOrderByTransactionDateDescCreatedAtDesc(Pageable.ofSize(30))
                .getContent()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getOutstandingReceivables() {
        // Find all pending and overdue transactions
        List<Transaction> pending = transactionRepository.findByStatusInOrderByDueDateAsc(
                List.of(TransactionStatus.PENDING, TransactionStatus.OVERDUE)
        );

        LocalDate now = LocalDate.now();
        // Dynamically update status in view if overdue
        return pending.stream().map(t -> {
            if (t.getStatus() == TransactionStatus.PENDING && t.getDueDate() != null && t.getDueDate().isBefore(now)) {
                t.setStatus(TransactionStatus.OVERDUE);
            }
            return mapToResponse(t);
        }).toList();
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getOverdueTransactions() {
        List<Transaction> overdue = transactionRepository.findOverdueTransactions(TransactionStatus.PENDING, LocalDate.now());
        List<Transaction> alreadyOverdue = transactionRepository.findByStatusOrderByDueDateAsc(TransactionStatus.OVERDUE);

        return java.util.stream.Stream.concat(overdue.stream(), alreadyOverdue.stream())
                .distinct()
                .map(t -> {
                    t.setStatus(TransactionStatus.OVERDUE);
                    return mapToResponse(t);
                })
                .toList();
    }

    private TransactionResponse mapToResponse(Transaction t) {
        Long daysOverdue = null;
        if (t.getDueDate() != null) {
            LocalDate now = LocalDate.now();
            if (now.isAfter(t.getDueDate())) {
                daysOverdue = ChronoUnit.DAYS.between(t.getDueDate(), now);
            }
        }

        String formattedAmount = "NPR " + String.format("%,.2f", t.getAmount());

        return TransactionResponse.builder()
                .id(t.getId())
                .amount(t.getAmount())
                .formattedAmount(formattedAmount)
                .type(t.getType())
                .category(t.getCategory())
                .transactionDate(t.getTransactionDate())
                .status(t.getStatus())
                .dueDate(t.getDueDate())
                .daysOverdue(daysOverdue)
                .customerId(t.getCustomer() != null ? t.getCustomer().getId() : null)
                .customerName(t.getCustomer() != null ? t.getCustomer().getName() : null)
                .customerPhone(t.getCustomer() != null ? t.getCustomer().getPhoneNumber() : null)
                .customerEmail(t.getCustomer() != null ? t.getCustomer().getCorporateEmail() : null)
                .notes(t.getNotes())
                .paymentReference(t.getPaymentReference())
                .createdByUsername(t.getCreatedBy() != null ? t.getCreatedBy().getUsername() : null)
                .createdAt(t.getCreatedAt())
                .build();
    }
}
