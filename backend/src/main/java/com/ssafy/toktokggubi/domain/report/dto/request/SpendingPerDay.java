package com.ssafy.toktokggubi.domain.report.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 특정 날짜의 지출 내역을 담는 DTO.
 * AI 월간 리포트의 지출 상세 섹션에 포함됩니다.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpendingPerDay {
    private String date;
    private List<SpendingTransaction> transactions;
}