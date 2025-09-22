/*
package com.ssafy.toktokggubi.domain.push.controller;

import com.ssafy.toktokggubi.domain.push.dto.ThresholdCheckRequest;
import com.ssafy.toktokggubi.domain.push.dto.ThresholdCheckResult;
import com.ssafy.toktokggubi.domain.push.service.CategoryBudgetService;
//import com.ssafy.toktokggubi.domain.push.service.TotalBudgetService;
import com.ssafy.toktokggubi.global.security.utils.SecurityUtils;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/push")
@RequiredArgsConstructor
@Tag(name = "AI 소비코칭", description = "AI 소비코칭 관련 API")
public class PushController {

    private final CategoryBudgetService categoryService;
    private final TotalBudgetService totalService;

    @PostMapping("/budget/category/threshold")

    public ResponseEntity<ThresholdCheckResult> checkThresholdOnNewTx(
            @RequestBody ThresholdCheckRequest req
    ) {
        Long userId = SecurityUtils.currentUserIdOrNull();
        ThresholdCheckResult result = categoryService.checkAndMaybeNotifyForCurrentMonth(req.transactionUniqueNo());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/budget/category/exceed")
    public ResponseEntity<ThresholdCheckResult> checkExceedOnNewTx(
            @RequestBody ThresholdCheckRequest req
    ) {
        Long userId = SecurityUtils.currentUserIdOrNull();
        ThresholdCheckResult result = categoryService.checkAndNotifyIfExceeded(req.transactionUniqueNo());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/budget/total/threshold")
    public ResponseEntity<ThresholdCheckResult> checkTotalThresholdOnNewTx(
            @RequestBody ThresholdCheckRequest req
    ) {
        Long userId = SecurityUtils.currentUserIdOrNull();
        ThresholdCheckResult result =
                totalService.checkThreshold(req.transactionUniqueNo());
        return ResponseEntity.ok(result);
    }
    @PostMapping("/budget/total/exceed")
    public ResponseEntity<ThresholdCheckResult> checkTotalExceedOnNewTx(
            @RequestBody ThresholdCheckRequest req
    ) {
        Long userId = SecurityUtils.currentUserIdOrNull();
        ThresholdCheckResult result =
                totalService.checkExceed(req.transactionUniqueNo());
        return ResponseEntity.ok(result);
    }
}

*/
