package com.ssafy.toktokggubi.domain.finance.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record CardRec(
        String cardNo,
        String cvc,
        String cardUniqueNo,
        String cardIssuerCode,
        String cardIssuerName,
        String cardName,
        String baselinePerformance,
        String maxBenefitLimit,
        String cardDescription,
        String cardExpiryDate,
        String withdrawalAccountNo,
        String withdrawalDate
) {
}
