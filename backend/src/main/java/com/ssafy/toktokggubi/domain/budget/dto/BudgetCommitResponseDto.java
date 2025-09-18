package com.ssafy.toktokggubi.domain.budget.dto;


/**
 * /budget/commit 응답
 */
public record BudgetCommitResponseDto(
        String status,            // "COMMITTED"
        Long budgetId,
        Long userId,
        String budgetYm,
        Long totalAmount,
        Integer fixedExpenseCount,
        Integer categoryCount
) {
    public static BudgetCommitResponseDto committed(Long id, Long uid, String ym, Long total, int fe, int cat) {
        return new BudgetCommitResponseDto("COMMITTED", id, uid, ym, total, fe, cat);
    }
}
