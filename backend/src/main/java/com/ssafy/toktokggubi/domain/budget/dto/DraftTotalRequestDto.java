package com.ssafy.toktokggubi.domain.budget.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

public record DraftTotalRequestDto(
        @NotNull
        @Schema(description = "총예산(원)", example = "2200000")
        Long totalAmount
) {}
