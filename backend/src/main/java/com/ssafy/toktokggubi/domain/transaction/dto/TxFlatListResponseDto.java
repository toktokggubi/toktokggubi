package com.ssafy.toktokggubi.domain.transaction.dto;

import java.util.List;

// TxFlatListResponseDto.java (이미 없다면 생성)
public record TxFlatListResponseDto(
        long userId,
        PeriodRange period,   // 전체일 때 null 반환해도 OK
        List<Item> items
) {
    public record PeriodRange(String fromYmd, String toYmd) {
    }

    public record Item(
            long categoryId,
            String categoryName,
            String transactionUniqueNo,
            String dateTime, // ISO yyyy-MM-ddTHH:mm:ss
            long amount,
            String cardStatus,
            long merchantId,
            String merchantName,
            long userCardId,
            String cardName
    ) {
    }
}
