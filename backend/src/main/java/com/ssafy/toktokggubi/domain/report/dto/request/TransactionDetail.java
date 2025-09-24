package com.ssafy.toktokggubi.domain.report.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 이상 지출 내역의 개별 거래 상세 정보를 담는 DTO.
 * AI 월간 리포트의 이상 지출 섹션에 포함됩니다.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionDetail {
    private Integer amount;
    private String location;
    private String date;
}