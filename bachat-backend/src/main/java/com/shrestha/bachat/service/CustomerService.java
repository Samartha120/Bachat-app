package com.shrestha.bachat.service;

import com.shrestha.bachat.dto.CustomerRequest;
import com.shrestha.bachat.dto.CustomerResponse;
import com.shrestha.bachat.exception.ResourceNotFoundException;
import com.shrestha.bachat.model.Customer;
import com.shrestha.bachat.repository.CustomerRepository;
import com.shrestha.bachat.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final TransactionRepository transactionRepository;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public List<CustomerResponse> getAllCustomers(boolean onlyActive) {
        List<Customer> customers = onlyActive
                ? customerRepository.findByActiveTrueOrderByNameAsc()
                : customerRepository.findAll();

        return customers.stream().map(this::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<CustomerResponse> searchCustomers(String query) {
        if (query == null || query.isBlank()) {
            return getAllCustomers(true);
        }
        return customerRepository.searchCustomers(query.trim())
                .stream().map(this::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public CustomerResponse getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
        return mapToResponse(customer);
    }

    @Transactional
    public CustomerResponse createCustomer(CustomerRequest request, String currentUsername) {
        Customer customer = Customer.builder()
                .name(request.getName().trim())
                .corporateEmail(request.getCorporateEmail() != null ? request.getCorporateEmail().trim() : null)
                .phoneNumber(request.getPhoneNumber().trim())
                .address(request.getAddress() != null ? request.getAddress().trim() : null)
                .panVatNumber(request.getPanVatNumber() != null ? request.getPanVatNumber().trim() : null)
                .active(request.isActive())
                .build();

        Customer saved = customerRepository.save(customer);

        auditLogService.recordAction(
                currentUsername,
                "CUSTOMER_CREATE",
                "Customer#" + saved.getId(),
                "Created customer/client profile: " + saved.getName()
        );

        return mapToResponse(saved);
    }

    @Transactional
    public CustomerResponse updateCustomer(Long id, CustomerRequest request, String currentUsername) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));

        customer.setName(request.getName().trim());
        customer.setCorporateEmail(request.getCorporateEmail() != null ? request.getCorporateEmail().trim() : null);
        customer.setPhoneNumber(request.getPhoneNumber().trim());
        customer.setAddress(request.getAddress() != null ? request.getAddress().trim() : null);
        customer.setPanVatNumber(request.getPanVatNumber() != null ? request.getPanVatNumber().trim() : null);
        customer.setActive(request.isActive());

        Customer updated = customerRepository.save(customer);

        auditLogService.recordAction(
                currentUsername,
                "CUSTOMER_UPDATE",
                "Customer#" + updated.getId(),
                "Updated client profile: " + updated.getName()
        );

        return mapToResponse(updated);
    }

    @Transactional
    public CustomerResponse toggleCustomerStatus(Long id, String currentUsername) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));

        customer.setActive(!customer.isActive());
        Customer saved = customerRepository.save(customer);

        auditLogService.recordAction(
                currentUsername,
                saved.isActive() ? "CUSTOMER_ACTIVATE" : "CUSTOMER_DEACTIVATE",
                "Customer#" + saved.getId(),
                "Changed active status to: " + saved.isActive()
        );

        return mapToResponse(saved);
    }

    private CustomerResponse mapToResponse(Customer customer) {
        BigDecimal outstanding = transactionRepository.sumOutstandingByCustomer(customer.getId());
        if (outstanding == null) {
            outstanding = BigDecimal.ZERO;
        }

        int transactionCount = transactionRepository.findByCustomerIdOrderByTransactionDateDesc(customer.getId()).size();

        String formatted = "NPR " + String.format("%,.2f", outstanding);

        return CustomerResponse.builder()
                .id(customer.getId())
                .name(customer.getName())
                .corporateEmail(customer.getCorporateEmail())
                .phoneNumber(customer.getPhoneNumber())
                .address(customer.getAddress())
                .panVatNumber(customer.getPanVatNumber())
                .active(customer.isActive())
                .outstandingBalance(outstanding)
                .formattedOutstandingBalance(formatted)
                .transactionCount(transactionCount)
                .createdAt(customer.getCreatedAt())
                .build();
    }
}
