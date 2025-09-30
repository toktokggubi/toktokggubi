package com.ssafy.toktokggubi.domain.wallet.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record BestCardsResponse(
        String merchantName,
        Long merchantId,              // null 가능 (이름만 받은 경우)
        Long amount,                  // null 가능
        List<CardOffer> offers
) {
    public record CardOffer(
            Long userCardId,
            String issuerName,
            String cardName,
            String cardType,
            BigDecimal discountRate,  // percent
            Long estimatedFinalAmount // amount 있을 때만 계산, 없으면 null
    ) {
    }
}
