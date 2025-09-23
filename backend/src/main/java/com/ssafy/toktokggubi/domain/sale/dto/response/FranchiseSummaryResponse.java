package com.ssafy.toktokggubi.domain.sale.dto.response;

public record FranchiseSummaryResponse(
        Long franchiseId,
        String merchantName,
        String imageUrl
) {}
