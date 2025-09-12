package com.ssafy.toktokggubi.domain.transaction.controller;

import com.ssafy.toktokggubi.domain.transaction.dto.TxSummaryResponse;
import com.ssafy.toktokggubi.domain.transaction.service.TransactionService;
import com.ssafy.toktokggubi.global.time.YmResolver;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/transaction")
public class TransactionController {

    private final TransactionService service;
    private final YmResolver ymResolver;

    @GetMapping("/summary")
    @Operation(
            summary = "TX-1 이번 달 소비 금액 조회(전체)",
            description = "period=current, groupBy=none 만 지원"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 파라미터"),
            @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    public TxSummaryResponse getMonthlySummary(
            @RequestParam("userId") long userId,
            @RequestParam(name = "period", defaultValue = "current") String period,
            @RequestParam(name = "groupBy", defaultValue = "none") String groupBy
    ) {
        if (!"current".equalsIgnoreCase(period)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only period=current is supported");
        }
        if (!"none".equalsIgnoreCase(groupBy)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only groupBy=none is supported");
        }

        String ym = ymResolver.nowYm(); // e.g. "202510"
        return service.getMonthlySummary(userId, ym);
    }
}
