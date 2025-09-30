package com.ssafy.toktokggubi.domain.report.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * AI 월간 리포트의 요약 보고서 섹션을 담는 DTO.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SummaryReport {
    /**
     * 전체 요약.
     * JSON 필드명 `overall_summary`에 매핑됩니다.
     */
    private String overallSummary;
    /**
     * 월별 지출 요약.
     * JSON 필드명 `monthly_spending_summary`에 매핑됩니다.
     */
    private MonthlySpendingSummary monthlySpendingSummary;
    /**
     * 카테고리별 지출 목록.
     * JSON 필드명 `spending_by_category`에 매핑됩니다.
     */
    private List<SpendingByCategory> spendingByCategory;
    /**
     * 이상 지출 정보.
     * JSON 필드명 `abnormal_spending`에 매핑됩니다.
     */
    private AbnormalSpending abnormalSpending;
    /**
     * 예산 조정 제안.
     * JSON 필드명 `budget_adjustment`에 매핑됩니다.
     */
    private BudgetAdjustment budgetAdjustment;
}