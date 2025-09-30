package com.ssafy.toktokggubi.domain.budget.dto;

public record FixedExpenseDto(
        String title,
        Long amount,
        Integer payDay,          // 1~31
        Boolean includeInBudget  // null이면 서버에서 true로 처리
) {
}