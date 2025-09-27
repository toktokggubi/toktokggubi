package com.ssafy.toktokggubi.domain.budget.dto;

public record BudgetSaveResponseDto(
        String budgetYm,
        Long userMonthlyBudgetId,
        int fixedExpenseCount,
        int budgetCategoryCount
) {}
