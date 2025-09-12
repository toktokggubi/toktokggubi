package com.ssafy.toktokggubi.domain.transaction.dto;

public record TxSummaryResponse(
        String month,       // "YYYYMM"
        long totalAmount,
        long totalCount
) {}
