package com.ssafy.toktokggubi.domain.wallet.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record CardBenefitsResponse(
        Long userCardId,
        List<BenefitItem> benefits
) {
    public record BenefitItem(
            Long franchiseId,
            String franchiseName,
            BigDecimal discountRate // percent
    ) {}
}
