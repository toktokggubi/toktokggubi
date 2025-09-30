package com.ssafy.toktokggubi.domain.budget.controller;

import com.ssafy.toktokggubi.domain.budget.BudgetRecommendationScheduler;
import com.ssafy.toktokggubi.global.time.YmResolver;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/ai/budget")
@RequiredArgsConstructor
@Tag(name = "ai예산 카테고리", description = "스케쥴러 통해 1일 사용자들의 카테고리값 반영")
public class BudgetRecommendationAdminController {

    private final BudgetRecommendationScheduler scheduler;
    private final YmResolver ymResolver;

    @PostMapping("/run-once")
    public BudgetRecommendationScheduler.ManualRunSummary runOnce(

    ) {
        String ym = ymResolver.prevYm();
        return scheduler.runOnce(ym);
    }
}
