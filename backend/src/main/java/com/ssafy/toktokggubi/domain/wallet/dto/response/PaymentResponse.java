package com.ssafy.toktokggubi.domain.wallet.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentResponse(
        String transactionUniqueNo,
        String status,             // APPROVED / CANCEL / DECLINED
        Long userCardId,
        Long merchantId,
        String merchantName,
        Long originalAmount,
        BigDecimal discountRate,   // 적용된 퍼센트(없으면 0)
        Long discountAmount,       // 원
        Long finalAmount,          // 원
        String transactionYmd,     // YYYYMMDD
        String transactionHms,     // HHMMSS
        LocalDateTime createdAt
) {
}
