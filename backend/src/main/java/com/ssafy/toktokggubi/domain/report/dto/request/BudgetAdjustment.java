package com.ssafy.toktokggubi.domain.report.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 예산 조정 제안 정보를 담는 DTO.
 * AI 월간 리포트의 요약 보고서 섹션에 포함됩니다.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetAdjustment {
    private String category;
    private Integer currentSpending;
    private Integer budget;
    private String recommendation;
}