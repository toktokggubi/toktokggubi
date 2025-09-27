package com.ssafy.toktokggubi.global.time;

import org.springframework.stereotype.Component;

import java.time.YearMonth;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Component
public class YmResolver {
    private static final ZoneId ZONE = ZoneId.of("Asia/Seoul");
    private static final DateTimeFormatter YM = DateTimeFormatter.ofPattern("yyyyMM");

    /** 항상 한국시간 기준 현재 달(YYYYMM) */
    public String nowYm() {
        return YearMonth.now(ZONE).format(YM);
    }

    /** 입력받은 YYYYMM 유효성 검증 후 그대로 반환 */
    public String normalizeOrThrow(String budgetYm) {
        if (budgetYm == null || !budgetYm.matches("\\d{6}")) {
            throw new IllegalArgumentException("budgetYm must be yyyyMM (e.g. 202510)");
        }
        return budgetYm;
    }
    /** 지난달 yyyyMM */
    public String prevYm() {
        return YearMonth.now(ZONE).minusMonths(1).format(DateTimeFormatter.ofPattern("yyyyMM"));
    }
}
