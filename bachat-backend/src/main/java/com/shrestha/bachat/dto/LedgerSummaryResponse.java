package com.shrestha.bachat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LedgerSummaryResponse {
    private String timeBucket; // TODAY, THIS_WEEK, THIS_MONTH, THIS_YEAR
    private LocalDate startDate;
    private LocalDate endDate;
    
    // Exact BigDecimal arithmetic
    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal netMargin;
    private BigDecimal agingReceivables;
    private BigDecimal totalReceivablesOverdue;
    
    // Formatted strings with NPR currency symbol
    private String formattedTotalIncome;
    private String formattedTotalExpenses;
    private String formattedNetMargin;
    private String formattedAgingReceivables;
    private String formattedReceivablesOverdue;

    private long totalTransactionsCount;
    private long overdueTransactionsCount;
    private long pendingTransactionsCount;

    // Data points formatted for mobile charting (react-native-gifted-charts)
    private List<TimeBucketChartPoint> chartPoints;
}
