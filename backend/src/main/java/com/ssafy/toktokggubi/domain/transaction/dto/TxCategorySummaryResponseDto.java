package com.ssafy.toktokggubi.domain.transaction.dto;

import java.util.List;

public record TxCategorySummaryResponseDto(
        String month,
        List<TxCategorySummaryItemDto> categories
) {
}

