package com.ssafy.toktokggubi.domain.push.controller;

import com.ssafy.toktokggubi.domain.push.dto.ThresholdCheckResponse;
import com.ssafy.toktokggubi.domain.push.service.CategoryBudgetService;
import com.ssafy.toktokggubi.domain.push.service.TotalBudgetService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/push/threshold")
@Tag(name = "Budget Threshold", description = "예산 임계/초과 푸시 트리거")
@RequiredArgsConstructor
@Validated
public class CheckTestController {

    private final CategoryBudgetService categoryBudgetService;
    private final TotalBudgetService totalBudgetService;

    // ─────────────────────────────────────────────────────────────
    // CATEGORY
    // ─────────────────────────────────────────────────────────────

    @PostMapping("/category/check")
    public ResponseEntity<ThresholdCheckResponse> categoryCheck(
            @RequestParam("txNo") @NotBlank String txNo) throws Exception {

        ThresholdCheckResponse resp = categoryBudgetService.checkThreshold(txNo);
        return ResponseEntity.ok(resp);
    }


    @PostMapping("/category/exceed")
    public ResponseEntity<ThresholdCheckResponse> categoryExceed(
            @RequestParam("txNo") @NotBlank String txNo) throws Exception {

        ThresholdCheckResponse resp = categoryBudgetService.checkExceed(txNo);
        return ResponseEntity.ok(resp);
    }

    // ─────────────────────────────────────────────────────────────
    // TOTAL
    // ─────────────────────────────────────────────────────────────

    @PostMapping("/total/check")
    public ResponseEntity<ThresholdCheckResponse> totalCheck(
            @RequestParam("txNo") @NotBlank String txNo) throws Exception {

        ThresholdCheckResponse resp = totalBudgetService.checkThreshold(txNo);
        return ResponseEntity.ok(resp);
    }


    @PostMapping("/total/exceed")
    public ResponseEntity<ThresholdCheckResponse> totalExceed(
            @RequestParam("txNo") @NotBlank String txNo) throws Exception {

        ThresholdCheckResponse resp = totalBudgetService.checkExceed(txNo);
        return ResponseEntity.ok(resp);
    }
}
