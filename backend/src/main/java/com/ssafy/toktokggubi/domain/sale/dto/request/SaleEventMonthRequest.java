package com.ssafy.toktokggubi.domain.sale.dto.request;

import jakarta.validation.constraints.*;
import java.time.YearMonth;

public record SaleEventMonthRequest(
        @Min(2000) @Max(2100) int year,
        @Min(1) @Max(12) int month,
        Long franchiseId // optional
) {
    public YearMonth toYearMonth() { return YearMonth.of(year, month); }
}
