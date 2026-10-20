package com.shrestha.bachat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimeBucketChartPoint {
    private String label;
    private BigDecimal income;
    private BigDecimal expense;
    private BigDecimal net;
    private double chartIncomeValue;
    private double chartExpenseValue;
}
