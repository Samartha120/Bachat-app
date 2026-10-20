package com.shrestha.bachat.controller;

import com.shrestha.bachat.dto.LedgerSummaryResponse;
import com.shrestha.bachat.service.LedgerEngineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/ledger")
@RequiredArgsConstructor
public class LedgerController {

    private final LedgerEngineService ledgerEngineService;

    @GetMapping("/summary")
    public ResponseEntity<LedgerSummaryResponse> getLedgerSummary(
            @RequestParam(defaultValue = "THIS_MONTH") String timeBucket) {
        return ResponseEntity.ok(ledgerEngineService.getSummary(timeBucket));
    }
}
