package com.ssafy.toktokggubi.domain.transaction.controller;

import com.ssafy.toktokggubi.domain.transaction.dto.TxCategoryListResponseDto;
import com.ssafy.toktokggubi.domain.transaction.dto.TxCategorySummaryResponseDto;
import com.ssafy.toktokggubi.domain.transaction.dto.TxSummaryResponseDto;
import com.ssafy.toktokggubi.domain.transaction.service.TransactionService;
import com.ssafy.toktokggubi.global.security.utils.SecurityUtils;
import com.ssafy.toktokggubi.global.time.YmResolver;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@RestController
@RequiredArgsConstructor
@RequestMapping("/transaction")
@Tag(name = "소비내역조회", description = "소비내역조회 관련 API")
public class TransactionController {

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE;         // yyyy-MM-dd
    private static final DateTimeFormatter COMPACT = DateTimeFormatter.BASIC_ISO_DATE;     // yyyyMMdd
    private final TransactionService service;
    private final YmResolver ymResolver;

    // ---- TX-1 이번 달 소비 금액 조회 (전체) ----
    @GetMapping("/summary")

    public TxSummaryResponseDto getMonthlySummary(
            @RequestParam(name = "from", required = false) String fromStr,
            @RequestParam(name = "to", required = false) String toStr
    ) {

        Long userId = SecurityUtils.currentUserIdOrNull();
        if (userId == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인 필요");

        LocalDate from;
        LocalDate to;
        // from/to가 없으면 현재달 1~말일로 기본 처리
        if (fromStr == null && toStr == null) {
            // 이번 달 1일 ~ 말일 (YearMonth 없이 계산)
            String ym = ymResolver.nowYm(); // "yyyyMM"
            int y = Integer.parseInt(ym.substring(0, 4));
            int m = Integer.parseInt(ym.substring(4, 6));
            from = LocalDate.of(y, m, 1);
            to = LocalDate.of(y, m, 1).withDayOfMonth(LocalDate.of(y, m, 1).lengthOfMonth());
        } else if (fromStr != null && toStr != null) {
            from = parseFlexibleDate(fromStr);
            to = parseFlexibleDate(toStr);
            if (to.isBefore(from)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "'to' must be on/after 'from'.");
            }
        } else {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Both 'from' and 'to' are required together (yyyyMMdd or yyyy-MM-dd), or omit both."
            );
        }

        return service.getSummaryByRange(userId, from, to);

    }
    /* ---------- helpers ---------- */

    // ---- TX-1 이번 달 소비 금액 조회 (카테고리별) ----
    @GetMapping("/summary/category")

    public TxCategorySummaryResponseDto getMonthlyByCategory() {
        Long userId = SecurityUtils.currentUserIdOrNull();
        if (userId == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인 필요");

        String ym = ymResolver.nowYm();
        return service.getMonthlyByCategory(userId, ym);
    }

    // 카테고리별 거래 목록(이번 달) — userId만 필수, sizePerCategory는 선택(기본 2)
    @GetMapping("/category")

    public TxCategoryListResponseDto getCurrentMonthCategoryList(

    ) {
        Long userId = SecurityUtils.currentUserIdOrNull();
        if (userId == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인 필요");

        String ym = ymResolver.nowYm();
        return service.getCurrentMonthCategoryList(userId, ym); // 내부에서 이번 달 계산

    }

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
