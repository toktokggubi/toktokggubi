package com.ssafy.toktokggubi.domain.report.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 이상 지출 정보를 담는 DTO.
 * AI 월간 리포트의 요약 보고서 섹션에 포함됩니다.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AbnormalSpending {
    /**
     * 총 이상 지출 금액.
     * JSON 필드명 `total_abnormal_spending`에 매핑됩니다.
     */
    private Integer totalAbnormalSpending;
    /**
     * 이상 지출 거래 내역 목록.
     */
    private List<TransactionDetail> transactions;
}