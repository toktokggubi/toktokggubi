// com.ssafy.toktokggubi.domain.push.dto.ThresholdCheckResponse
package com.ssafy.toktokggubi.domain.push.dto;

public record ThresholdCheckResponse(
        boolean triggered,
        Long userId,
        Long categoryId,   // TOTAL이면 null
        String scope,      // "CATEGORY" | "TOTAL"
        String budgetYm,   // yyyyMM
        Long usedAmount,
        Long finalAmount,
        boolean sent
) {}
