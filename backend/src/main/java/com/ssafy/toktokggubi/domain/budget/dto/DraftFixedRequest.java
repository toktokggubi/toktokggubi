// BD-3: 버전 + 고정지출만
package com.ssafy.toktokggubi.domain.budget.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

public record DraftFixedRequest(
        @Schema(description="직전 응답의 스냅샷 버전", example="1", requiredMode = Schema.RequiredMode.REQUIRED)
        Integer expectedVersion,
        @Schema(description="고정지출 항목 리스트")
        List<FixedExpenseDto> fixedExpenses
) {}
