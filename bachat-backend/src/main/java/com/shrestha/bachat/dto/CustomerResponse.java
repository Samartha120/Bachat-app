package com.shrestha.bachat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerResponse {
    private Long id;
    private String name;
    private String corporateEmail;
    private String phoneNumber;
    private String address;
    private String panVatNumber;
    private boolean active;
    private BigDecimal outstandingBalance;
    private String formattedOutstandingBalance;
    private int transactionCount;
    private LocalDateTime createdAt;
}
