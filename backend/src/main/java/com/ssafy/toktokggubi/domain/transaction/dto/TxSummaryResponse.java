package com.ssafy.toktokggubi.domain.transaction.dto;

public record TxSummaryResponse(
        String from,        // ISO yyyy-MM-dd
        String to,          // ISO yyyy-MM-dd
        long totalAmount,
        long totalCount
) {}
