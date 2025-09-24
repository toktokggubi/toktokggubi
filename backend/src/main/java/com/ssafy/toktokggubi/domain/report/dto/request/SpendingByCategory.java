package com.ssafy.toktokggubi.domain.report.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 카테고리별 지출 정보를 담는 DTO.
 * AI 월간 리포트의 요약 보고서 섹션에 포함됩니다.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpendingByCategory {
    private String category;
    private Double percentage;
    private Integer amount;
    private Integer budget;
}