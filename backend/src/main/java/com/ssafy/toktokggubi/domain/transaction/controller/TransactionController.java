package com.ssafy.toktokggubi.domain.transaction.controller;

import com.ssafy.toktokggubi.domain.transaction.dto.TxCategorySummaryResponse;
import com.ssafy.toktokggubi.domain.transaction.dto.TxSummaryResponse;
import com.ssafy.toktokggubi.domain.transaction.service.TransactionService;
import com.ssafy.toktokggubi.global.time.YmResolver;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/transaction")
@Tag(name = "소비내역조회", description = "소비내역조회 관련 API")
public class TransactionController {

    private final TransactionService service;
    private final YmResolver ymResolver;

    // ---- TX-1 이번 달 소비 금액 조회 (전체) ----
    @GetMapping("/summary")
    @Operation(summary = "TX-1 이번 달 소비 금액 조회(전체)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공")
    })
    public TxSummaryResponse getMonthlySummary(
            @RequestParam("userId") long userId
    ) {
        String ym = ymResolver.nowYm(); // 예: "202509"
        return service.getMonthlySummary(userId, ym);
    }

    // ---- TX-1 이번 달 소비 금액 조회 (카테고리별) ----
    @GetMapping("/summary/category")
    @Operation(summary = "TX-1 이번 달 소비 금액 조회(카테고리별)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공")
    })
    public TxCategorySummaryResponse getMonthlyByCategory(
            @RequestParam("userId") long userId
    ) {
        String ym = ymResolver.nowYm();
        return service.getMonthlyByCategory(userId, ym);
    }
}
