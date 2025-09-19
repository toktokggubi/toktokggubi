package com.ssafy.toktokggubi.domain.push.dto;

public record ThresholdCheckResult(
      boolean triggered,
       Long userId,
        String categoryId,
      String budgetYm,
         Long usedAmount,
         Long finalAmount,
        boolean sent
) {}