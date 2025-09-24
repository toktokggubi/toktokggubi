package com.ssafy.toktokggubi.domain.report.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 월별 지출 요약 정보를 담는 DTO.
 * AI 월간 리포트의 요약 보고서 섹션에 포함됩니다.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlySpendingSummary {
    private String month;
    @JsonProperty("total_spending")
    private Integer totalSpending;
    @JsonProperty("budget_usage_percentage")
    private Integer budgetUsagePercentage;
    @JsonProperty("income_usage_percentage")
    private Integer incomeUsagePercentage;
}