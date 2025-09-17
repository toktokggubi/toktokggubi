package com.ssafy.toktokggubi.domain.wallet.dto.request;

public record PaymentRequest(
        Long userCardId,
        Long merchantId,     // QR에 있으면 사용. 없으면 merchantName으로 조회
        String merchantName, // QR에 있으면 사용
        Long amount          // 결제 원금(원)
) {}