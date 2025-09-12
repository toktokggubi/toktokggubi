package com.ssafy.toktokggubi.domain.transaction.dto;

import java.util.List;

public record TxCategorySummaryResponse(
        String month,
        List<TxCategorySummaryItem> categories
) {}

