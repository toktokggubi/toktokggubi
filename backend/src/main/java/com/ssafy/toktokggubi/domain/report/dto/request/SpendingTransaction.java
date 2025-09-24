package com.ssafy.toktokggubi.domain.report.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 일별 지출 내역의 개별 거래 상세 정보를 담는 DTO.
 * AI 월간 리포트의 지출 상세 섹션에 포함됩니다.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpendingTransaction {
    private String merchant;
    private String category;
    /**
     * 결제 수단.
     * JSON 필드명 `payment_method`에 매핑됩니다.
     */
    @JsonProperty("payment_method")
    private String paymentMethod;
    private Integer amount;
}