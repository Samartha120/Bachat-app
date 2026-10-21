package com.shrestha.bachat.service;

import com.shrestha.bachat.dto.AuditLogResponse;
import com.shrestha.bachat.model.AuditLog;
import com.shrestha.bachat.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private static final Logger log = LoggerFactory.getLogger(AuditLogService.class);
    private final AuditLogRepository auditLogRepository;

    @Transactional
    @SuppressWarnings("null")
    public void recordAction(String username, String action, String targetEntity, String details) {
        String ipAddress = MDC.get("ip");
        if (ipAddress == null || ipAddress.isBlank()) {
            ipAddress = "127.0.0.1";
        }

        // Structured logging via SLF4J / Logback
        log.info("[AUDIT-LOG] User='{}', Action='{}', Target='{}', IP='{}', Details='{}'",
                username, action, targetEntity, ipAddress, details);

        // Persistent database audit log entry
        AuditLog auditLog = AuditLog.builder()
                .timestamp(LocalDateTime.now())
                .username(username != null ? username : "SYSTEM")
                .action(action)
                .ipAddress(ipAddress)
                .targetEntity(targetEntity)
                .details(details)
                .build();

        auditLogRepository.save(auditLog);
    }

    @Transactional(readOnly = true)
    public Page<AuditLogResponse> getAuditLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByTimestampDesc(pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponse> getRecentAuditLogs() {
        return auditLogRepository.findTop50ByOrderByTimestampDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private AuditLogResponse mapToResponse(AuditLog log) {
        return AuditLogResponse.builder()
                .id(log.getId())
                .timestamp(log.getTimestamp())
                .username(log.getUsername())
                .action(log.getAction())
                .ipAddress(log.getIpAddress())
                .targetEntity(log.getTargetEntity())
                .details(log.getDetails())
                .build();
    }
}
