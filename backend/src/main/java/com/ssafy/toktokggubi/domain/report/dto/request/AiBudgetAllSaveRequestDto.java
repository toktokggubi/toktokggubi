package com.ssafy.toktokggubi.domain.report.dto.request;

import com.ssafy.toktokggubi.domain.budget.dto.CategoryAllocDto;
import com.ssafy.toktokggubi.domain.budget.dto.FixedExpenseDto;

import java.util.List;

public record AiBudgetAllSaveRequestDto(

        Long userId,
        String username, // User.nickname 에 매칭
        Long totalAmount,
        List<FixedExpenseDto> fixedExpenses,
        List<Long> selectedCategories,
        List<CategoryAllocDto> categoryAllocations
) {
}
