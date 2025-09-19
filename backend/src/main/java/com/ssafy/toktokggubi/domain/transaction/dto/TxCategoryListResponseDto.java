package com.ssafy.toktokggubi.domain.transaction.dto;

import java.util.List;

public record TxCategoryListResponseDto(
        long userId,
        String period, // "current"
        PeriodRange range,
        List<CategoryBlock> categories
) {
    public record PeriodRange(String startDate, String endDate) {} // YYYYMMDD
    public record CategoryBlock(
            long categoryId,
            String categoryName,
            long totalAmount,
            long count,
            List<TxItem> transactions // 전체 거래 리스트 (프론트에서 잘라씀)
    ) {}
    public record TxItem(
            String transactionUniqueNo,
            String dateTime, // "YYYY-MM-DDTHH:MM:SS"
            long amount,
            String cardStatus,
            long merchantId,
            String merchantName,
            long userCardId,
            String cardName
    ) {}
}
