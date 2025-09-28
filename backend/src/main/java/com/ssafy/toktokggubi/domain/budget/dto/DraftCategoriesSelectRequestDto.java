package com.ssafy.toktokggubi.domain.budget.dto;

import io.swagger.v3.oas.annotations.media.Schema;

public record DraftCategoriesSelectRequestDto(
        @Schema(example = "2")
        Integer expectedVersion,
        @Schema(example = "[1,2,10]")
        java.util.List<Long> selectedCategories
) {
}