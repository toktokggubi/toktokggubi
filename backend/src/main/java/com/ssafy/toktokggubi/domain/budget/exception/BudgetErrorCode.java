package com.ssafy.toktokggubi.domain.budget.exception;

public enum BudgetErrorCode {
    VERSION_MISMATCH,          // 버전 불일치
    ALREADY_COMMITTED,         // 중복 커밋
    TOTAL_INVALID,             // 총예산 유효성
    FIXED_INVALID,             // 고정지출 유효성
    CATEGORIES_INVALID,        // 카테고리/배분 유효성
    BUDGET_OVERFLOW            // 카테고리 합계 > 가용금액
}
