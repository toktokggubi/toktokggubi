package com.ssafy.toktokggubi.domain.budget.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.annotation.Order;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;

@RestControllerAdvice(basePackages = "com.ssafy.toktokggubi.domain.budget")
@Order(1)
public class BudgetExceptionHandler {

    @ExceptionHandler(BudgetException.class)
    public ResponseEntity<ProblemDetail> handleBudget(BudgetException ex, HttpServletRequest req) {
        int status = switch (ex.getCode()) {
            case VERSION_MISMATCH, ALREADY_COMMITTED -> 409;
            case BUDGET_OVERFLOW, TOTAL_INVALID, FIXED_INVALID, CATEGORIES_INVALID -> 422;
        };
        ProblemDetail pd = ProblemDetail.forStatus(status);
        pd.setTitle(ex.getCode().name());
        pd.setDetail(ex.getMessage());
        pd.setType(URI.create("about:blank")); // 필요시 문서 URL
        pd.setProperty("path", req.getRequestURI());
        if (ex.getDetails() != null) {
            pd.setProperty("details", ex.getDetails());
        }
        return ResponseEntity.status(status).body(pd);
    }
}
