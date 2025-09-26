package com.ssafy.toktokggubi.domain.report.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetCategoryDetail {
    private String name;
    private Integer budget;
    private Integer currentSpending;
    private Integer totalAmount;
}
