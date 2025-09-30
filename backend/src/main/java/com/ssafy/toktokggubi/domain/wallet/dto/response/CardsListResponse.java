package com.ssafy.toktokggubi.domain.wallet.dto.response;


import java.util.List;

public record CardsListResponse(List<CardSummary> cards) {
    public record CardSummary(
            Long userCardId,
            String issuerName,
            String cardName,
            String cardType,       // CREDIT / CHECK
            String maskedCardNo,
            boolean active,
            String imageUrl
    ) {
    }
}