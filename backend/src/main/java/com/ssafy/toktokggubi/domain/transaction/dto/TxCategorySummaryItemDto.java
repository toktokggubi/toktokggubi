package com.ssafy.toktokggubi.domain.transaction.dto;

public record TxCategorySummaryItemDto(
        long categoryId,
        String categoryName,
        long amount,
        long count
) {}