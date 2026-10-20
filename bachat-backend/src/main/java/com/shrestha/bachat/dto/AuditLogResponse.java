package com.shrestha.bachat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponse {
    private Long id;
    private LocalDateTime timestamp;
    private String username;
    private String action;
    private String ipAddress;
    private String targetEntity;
    private String details;
}
