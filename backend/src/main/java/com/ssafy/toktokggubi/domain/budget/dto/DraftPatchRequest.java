package com.ssafy.toktokggubi.domain.budget.dto;

import java.util.List;

public record DraftPatchRequest(
        Integer expectedVersion,                 // 낙관적 락(현재 버전과 일치해야 저장)
        Long totalAmount,                        // 총예산
        List<FixedExpenseDto> fixedExpenses,     // 고정지출 리스트
        List<Long> selectedCategories,           // 선택된 카테고리 ID들
        List<CategoryAllocDto> categoryAllocations // 카테고리별 금액 할당
) {}

