// BD-6: 버전 + 카테고리 선택/배분만
package com.ssafy.toktokggubi.domain.budget.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

public record DraftCategoriesRequestDto(
        @Schema(description="직전 응답의 스냅샷 버전", example="2", requiredMode = Schema.RequiredMode.REQUIRED)
        Integer expectedVersion,
        @Schema(description="선택된 카테고리 ID 목록", example="[101,102,103]")
        List<Long> selectedCategories,
        @Schema(description="카테고리별 최종 배정액 목록")
        List<CategoryAllocDto> categoryAllocations
) {}
