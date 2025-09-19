package com.ssafy.toktokggubi.domain.transaction.controller;

import com.ssafy.toktokggubi.domain.transaction.dto.TxFlatListResponseDto;
import com.ssafy.toktokggubi.domain.transaction.service.TransactionService;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@RestController
@RequiredArgsConstructor
@RequestMapping("/ai")
@Tag(name = "Ai소비내역조회", description = "Ai소비내역조회 관련 API")
public class AiTransactionController {

    private final TransactionService service;

    @GetMapping("/transaction")
    public TxFlatListResponseDto getMonthlySummary(
            @RequestParam("userId") long userId,
            @RequestParam(value = "month", required = false) String ym // yyyyMM
    ) {
        return service.getTransactionListForAi(userId, ym);


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
