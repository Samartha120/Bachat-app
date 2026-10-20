package com.shrestha.bachat.controller;

import com.shrestha.bachat.dto.CustomerRequest;
import com.shrestha.bachat.dto.CustomerResponse;
import com.shrestha.bachat.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    public ResponseEntity<List<CustomerResponse>> getCustomers(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "false") boolean onlyActive) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(customerService.searchCustomers(search));
        }
        return ResponseEntity.ok(customerService.getAllCustomers(onlyActive));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerResponse> getCustomerById(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.getCustomerById(id));
    }

    @PostMapping
    public ResponseEntity<CustomerResponse> createCustomer(
            @Valid @RequestBody CustomerRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = (userDetails != null) ? userDetails.getUsername() : "ANONYMOUS";
        CustomerResponse created = customerService.createCustomer(request, username);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomerResponse> updateCustomer(
            @PathVariable Long id,
            @Valid @RequestBody CustomerRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = (userDetails != null) ? userDetails.getUsername() : "ANONYMOUS";
        return ResponseEntity.ok(customerService.updateCustomer(id, request, username));
    }

    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasAuthority('ROLE_OFFICE_ADMIN')")
    public ResponseEntity<CustomerResponse> toggleCustomerStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = (userDetails != null) ? userDetails.getUsername() : "ANONYMOUS";
        return ResponseEntity.ok(customerService.toggleCustomerStatus(id, username));
    }
}
