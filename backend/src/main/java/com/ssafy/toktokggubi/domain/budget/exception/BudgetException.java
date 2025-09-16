package com.ssafy.toktokggubi.domain.budget.exception;

import lombok.Getter;

import java.util.Map;

@Getter
public class BudgetException extends RuntimeException {
    private final BudgetErrorCode code;
    private final Map<String, Object> details; // 합계 등 디테일

    public BudgetException(BudgetErrorCode code, String message, Map<String, Object> details) {
        super(message);
        this.code = code;
        this.details = details;
    }
}
