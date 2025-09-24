package com.ssafy.toktokggubi.domain.report.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * AI 월간 리포트의 지출 상세 섹션을 담는 DTO.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpendingDetails {
    /**
     * 총 거래 건수.
     * JSON 필드명 `total_transactions`에 매핑됩니다.
     */
    @JsonProperty("total_transactions")
    private Integer totalTransactions;
    /**
     * 하루 최대 거래 건수.
     * JSON 필드명 `max_daily_transactions`에 매핑됩니다.
     */
    @JsonProperty("max_daily_transactions")
    private Integer maxDailyTransactions;
    /**
     * 일별 거래 건수.
     * JSON 필드명 `daily_transaction_counts`에 매핑됩니다.
     */
    @JsonProperty("daily_transaction_counts")
    private Map<String, Integer> dailyTransactionCounts;
    /**
     * 일별 지출 내역 목록.
     * JSON 필드명 `spending_per_day`에 매핑됩니다.
     */
    @JsonProperty("spending_per_day")
    private List<SpendingPerDay> spendingPerDay;
    /**
     * 상위 지출 가맹점 목록.
     * JSON 필드명 `top_spending_merchants`에 매핑됩니다.
     */
    @JsonProperty("top_spending_merchants")
    private List<TopSpendingMerchant> topSpendingMerchants;
}