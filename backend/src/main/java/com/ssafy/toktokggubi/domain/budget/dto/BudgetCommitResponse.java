package com.ssafy.toktokggubi.domain.budget.dto;


/**
 * /budget/commit 응답
 */
public record BudgetCommitResponse(
        String status,            // "COMMITTED"
        Long budgetId,
        Long userId,
        String budgetYm,
        Long totalAmount,
        Integer fixedExpenseCount,
        Integer categoryCount
) {
    public static BudgetCommitResponse committed(Long id, Long uid, String ym, Long total, int fe, int cat) {
        return new BudgetCommitResponse("COMMITTED", id, uid, ym, total, fe, cat);
    }
}
