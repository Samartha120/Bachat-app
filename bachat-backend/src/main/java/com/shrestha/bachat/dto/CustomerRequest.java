package com.shrestha.bachat.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerRequest {

    @NotBlank(message = "Customer or company name is required")
    @Size(max = 150, message = "Name must not exceed 150 characters")
    private String name;

    @Email(message = "Invalid corporate email format")
    @Size(max = 150, message = "Email must not exceed 150 characters")
    private String corporateEmail;

    @NotBlank(message = "Phone number is required")
    @Size(max = 50, message = "Phone number must not exceed 50 characters")
    private String phoneNumber;

    @Size(max = 255, message = "Address must not exceed 255 characters")
    private String address;

    @Size(max = 100, message = "PAN / VAT number must not exceed 100 characters")
    private String panVatNumber;

    @Builder.Default
    private boolean active = true;
}
