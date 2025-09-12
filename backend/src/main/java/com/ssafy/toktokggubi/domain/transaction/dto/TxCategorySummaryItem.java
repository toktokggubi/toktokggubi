package com.ssafy.toktokggubi.domain.transaction.dto;

public record TxCategorySummaryItem(
        long categoryId,
        String categoryName,
        long amount,
        long count
) {}