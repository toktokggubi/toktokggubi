package com.ssafy.toktokggubi.domain.budget.dto;

import java.util.List;
import java.time.OffsetDateTime;

/**
 * Redis에 저장/반환되는 Draft 스냅샷
 */
public record DraftSnapshotDto(
        Integer version,
        Long userId,
        String budgetYm,
        Long totalAmount,
        List<FixedExpenseDto> fixedExpenses,
        List<Long> selectedCategories,
        List<CategoryAllocDto> categoryAllocations,
        OffsetDateTime updatedAt
) {}
