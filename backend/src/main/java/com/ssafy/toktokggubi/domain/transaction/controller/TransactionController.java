package com.ssafy.toktokggubi.domain.transaction.controller;

import com.ssafy.toktokggubi.domain.transaction.dto.TxCategoryListResponse;
import com.ssafy.toktokggubi.domain.transaction.dto.TxCategorySummaryResponse;
import com.ssafy.toktokggubi.domain.transaction.dto.TxSummaryResponse;
import com.ssafy.toktokggubi.domain.transaction.service.TransactionService;
import com.ssafy.toktokggubi.global.security.utils.SecurityUtils;
import com.ssafy.toktokggubi.global.time.YmResolver;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.w3c.dom.ranges.Range;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@RestController
@RequiredArgsConstructor
@RequestMapping("/transaction")
@Tag(name = "소비내역조회", description = "소비내역조회 관련 API")
public class TransactionController {

    private final TransactionService service;
    private final YmResolver ymResolver;

    // ---- TX-1 이번 달 소비 금액 조회 (전체) ----
    @GetMapping("/summary")

    public TxSummaryResponse getMonthlySummary(
            @RequestParam(name = "from", required = false) String fromStr,
            @RequestParam(name = "to",   required = false) String toStr
    ) {
        LocalDate from;
        LocalDate to;
        // from/to가 없으면 현재달 1~말일로 기본 처리
        if (fromStr == null && toStr == null) {
            // 이번 달 1일 ~ 말일
            YearMonth ym = YearMonth.parse(ymResolver.nowYm(), DateTimeFormatter.ofPattern("yyyyMM"));
            from = ym.atDay(1);
            to   = ym.atEndOfMonth();
        } else if (fromStr != null && toStr != null) {
            from = parseFlexibleDate(fromStr);
            to   = parseFlexibleDate(toStr);
            if (to.isBefore(from)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "'to' must be on/after 'from'.");
            }
        } else {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Both 'from' and 'to' are required together (yyyyMMdd or yyyy-MM-dd), or omit both."
            );
        }
long userId = SecurityUtils.currentUserIdOrNull();
        return service.getSummaryByRange(userId, from, to);

    }

    // ---- TX-1 이번 달 소비 금액 조회 (카테고리별) ----
    @GetMapping("/summary/category")

    public TxCategorySummaryResponse getMonthlyByCategory() {
        long userId = SecurityUtils.currentUserIdOrNull();
        String ym = ymResolver.nowYm();
        return service.getMonthlyByCategory(userId, ym);
    }

    // 카테고리별 거래 목록(이번 달) — userId만 필수, sizePerCategory는 선택(기본 2)
    @GetMapping("/category")

    public TxCategoryListResponse getCurrentMonthCategoryList(

    ) {
        long userId=SecurityUtils.currentUserIdOrNull();
        String ym = ymResolver.nowYm();
        return service.getCurrentMonthCategoryList(userId, ym); // 내부에서 이번 달 계산

    }
    /* ---------- helpers ---------- */

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE;         // yyyy-MM-dd
    private static final DateTimeFormatter COMPACT = DateTimeFormatter.BASIC_ISO_DATE;     // yyyyMMdd

    private LocalDate parseFlexibleDate(String s) {
        // 공백 트리밍
        String v = s.trim();
        // 길이로 빠른 분기
        if (v.length() == 10 && v.charAt(4) == '-' && v.charAt(7) == '-') {
            // yyyy-MM-dd
            return LocalDate.parse(v, ISO);
        }
        if (v.length() == 8 && v.chars().allMatch(Character::isDigit)) {
            // yyyyMMdd
            return LocalDate.parse(v, COMPACT);
        }
        // 최종 실패
        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Invalid date format: '" + s + "'. Use yyyyMMdd or yyyy-MM-dd."
        );
    }
}
