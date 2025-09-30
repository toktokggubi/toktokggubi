package com.ssafy.toktokggubi.domain.transaction.dto;

public record TxSummaryResponseDto(
        String from,        // ISO yyyy-MM-dd
        String to,          // ISO yyyy-MM-dd
        long totalAmount,
        long totalCount
) {
}
