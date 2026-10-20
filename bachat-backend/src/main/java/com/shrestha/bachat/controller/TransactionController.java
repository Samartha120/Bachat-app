package com.shrestha.bachat.controller;

import com.shrestha.bachat.dto.TransactionRequest;
import com.shrestha.bachat.dto.TransactionResponse;
import com.shrestha.bachat.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    public ResponseEntity<Page<TransactionResponse>> getTransactions(Pageable pageable) {
        return ResponseEntity.ok(transactionService.getTransactions(pageable));
    }

    @GetMapping("/recent")
    public ResponseEntity<List<TransactionResponse>> getRecentTransactions() {
        return ResponseEntity.ok(transactionService.getRecentTransactions());
    }

    @GetMapping("/receivables")
    public ResponseEntity<List<TransactionResponse>> getOutstandingReceivables() {
        return ResponseEntity.ok(transactionService.getOutstandingReceivables());
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<TransactionResponse>> getOverdueTransactions() {
        return ResponseEntity.ok(transactionService.getOverdueTransactions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponse> getTransactionById(@PathVariable Long id) {
        return ResponseEntity.ok(transactionService.getTransactionById(id));
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> createTransaction(
            @Valid @RequestBody TransactionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = (userDetails != null) ? userDetails.getUsername() : "ANONYMOUS";
        TransactionResponse created = transactionService.createTransaction(request, username);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionResponse> updateTransaction(
            @PathVariable Long id,
            @Valid @RequestBody TransactionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = (userDetails != null) ? userDetails.getUsername() : "ANONYMOUS";
        return ResponseEntity.ok(transactionService.updateTransaction(id, request, username));
    }

    @PatchMapping("/{id}/pay")
    public ResponseEntity<TransactionResponse> markAsPaid(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = (userDetails != null) ? userDetails.getUsername() : "ANONYMOUS";
        return ResponseEntity.ok(transactionService.markAsPaid(id, username));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_OFFICE_ADMIN')")
    public ResponseEntity<Void> deleteTransaction(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = (userDetails != null) ? userDetails.getUsername() : "ANONYMOUS";
        transactionService.deleteTransaction(id, username);
        return ResponseEntity.noContent().build();
    }
}
