package com.ssafy.toktokggubi.domain.sale.dto.request;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record SaleEventPeriodRequest(
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate,
        Long franchiseId
) {
    public void validateRange() {
        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("endDate must be on/after startDate");
        }
    }
}
