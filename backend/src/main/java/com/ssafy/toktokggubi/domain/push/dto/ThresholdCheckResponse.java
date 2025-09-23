package com.ssafy.toktokggubi.domain.push.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ThresholdCheckResponse(
        boolean triggered,
        Long userId,
        Long categoryId,     // CATEGORY면 값, TOTAL이면 null
        String scope,        // "CATEGORY" | "TOTAL"
        String budgetYm,     // yyyyMM
        Long usedAmount,
        Long finalAmount,
        boolean sent
) {}
