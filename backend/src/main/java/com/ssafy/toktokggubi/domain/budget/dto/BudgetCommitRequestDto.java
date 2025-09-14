package com.ssafy.toktokggubi.domain.budget.dto;

/**
 * /budget/commit 요청 본문
 */
public record BudgetCommitRequestDto(
        Integer expectedVersion   // 마지막 draft 버전
) {}
