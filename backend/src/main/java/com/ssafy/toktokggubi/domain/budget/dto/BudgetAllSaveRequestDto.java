package com.ssafy.toktokggubi.domain.budget.dto;

import java.util.List;

public record BudgetAllSaveRequestDto(
        Long totalAmount,
        List<FixedExpenseDto> fixedExpenses,
        List<Long> selectedCategories,
        List<CategoryAllocDto> categoryAllocations
) {
}