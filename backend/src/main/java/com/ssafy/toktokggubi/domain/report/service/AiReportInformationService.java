package com.ssafy.toktokggubi.domain.report.service;

import com.ssafy.toktokggubi.domain.budget.repository.BudgetCategoryRepository;
import com.ssafy.toktokggubi.domain.budget.repository.UserMonthlyBudgetRepository;
import com.ssafy.toktokggubi.domain.report.dto.request.AiReportInformationRequest;
import com.ssafy.toktokggubi.domain.report.dto.response.AiReportInformationResponse;
import com.ssafy.toktokggubi.domain.report.support.CategoryKeyMapper;
import com.ssafy.toktokggubi.domain.transaction.repository.CardTransactionRepository;
import com.ssafy.toktokggubi.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.YearMonth;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiReportInformationService {

    private final UserRepository userRepo;
    private final UserMonthlyBudgetRepository umbRepo;
    private final BudgetCategoryRepository budgetCatRepo;
    private final CardTransactionRepository txAggRepo;

    public AiReportInformationResponse getInformation(AiReportInformationRequest req) {
        validate(req);

        // 0) 사용자 검증: userId + nickname 매칭
        userRepo.findByUserIdAndNickname(req.userId(), req.username())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "userId와 username(nickname)이 일치하는 사용자가 없습니다."));

        // 1) YM/기간 계산
        String mm = leftPad2(req.month());
        String ym = req.year() + mm; // YYYYMM
        YearMonth ymObj = YearMonth.of(Integer.parseInt(req.year()), Integer.parseInt(mm));
        String fromYmd = "%04d%02d01".formatted(ymObj.getYear(), ymObj.getMonthValue());
        String toYmd   = "%04d%02d%02d".formatted(ymObj.getYear(), ymObj.getMonthValue(), ymObj.lengthOfMonth());

        // 2) budget_set
        Map<String, Long> budget = new LinkedHashMap<>();
        long budgetTotal = umbRepo.findByUser_UserIdAndBudgetYmAndIsActiveTrue(req.userId(), ym)
                .map(umb -> Optional.ofNullable(umb.getTotalAmount()).orElse(0L))
                .orElse(0L);
        budget.put("total", budgetTotal);

        // 카테고리별: 프리셋(-1) 후 실제값 덮어쓰기
        Map<String, Long> catBudget = CategoryKeyMapper.emptyBudgetPreset();

        for (Object[] r : budgetCatRepo.findCatIdAndAmountForUserYm(req.userId(), ym)) {
            long catId = toLong(r[0]);
            Long finalAmt = toLongOrNull(r[1]); // null이면 -1 유지
            String key = CategoryKeyMapper.keyOf(catId);
            if (finalAmt != null) catBudget.put(key, finalAmt);
        }
        budget.putAll(catBudget);

        // 3) actual
        Map<String, Long> actual = new LinkedHashMap<>();
        long totalActual = Optional.ofNullable(txAggRepo.sumApprovedTotal(req.userId(), fromYmd, toYmd)).orElse(0L);
        actual.put("total", totalActual);

        Map<String, Long> catActual = CategoryKeyMapper.emptyActualPreset();
        for (Object[] r : txAggRepo.sumApprovedByCategoryId(req.userId(), fromYmd, toYmd)) {
            long catId = toLong(r[0]);
            long sum   = toLong(r[1]);
            String key = CategoryKeyMapper.keyOf(catId);
            catActual.put(key, sum);
        }
        actual.putAll(catActual);

        return new AiReportInformationResponse(budget, actual);
    }

    /* ---------- helpers ---------- */

    private void validate(AiReportInformationRequest req) {
        if (req.userId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userId는 필수입니다.");
        }
        if (req.username() == null || req.username().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "username(nickname)은 필수입니다.");
        }
        if (req.year() == null || !req.year().matches("\\d{4}")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "year는 yyyy 형식이어야 합니다.");
        }
        if (req.month() == null || !req.month().matches("\\d{1,2}")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "month는 1~12 형식의 숫자여야 합니다.");
        }
        int m = Integer.parseInt(req.month());
        if (m < 1 || m > 12) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "month는 1~12 범위여야 합니다.");
        }
    }

    private static String leftPad2(String s) {
        String v = s.trim();
        return (v.length() == 1) ? ("0" + v) : v;
    }

    private static long toLong(Object o) {
        if (o == null) return 0L;
        if (o instanceof Long l) return l;
        if (o instanceof Integer i) return i.longValue();
        if (o instanceof java.math.BigInteger bi) return bi.longValue();
        if (o instanceof java.math.BigDecimal bd) return bd.longValue();
        if (o instanceof Number n) return n.longValue();
        try { return Long.parseLong(o.toString()); } catch (Exception e) { return 0L; }
    }

    private static Long toLongOrNull(Object o) {
        if (o == null) return null;
        if (o instanceof Long l) return l;
        if (o instanceof Integer i) return i.longValue();
        if (o instanceof java.math.BigInteger bi) return bi.longValue();
        if (o instanceof java.math.BigDecimal bd) return bd.longValue();
        if (o instanceof Number n) return n.longValue();
        try { return Long.parseLong(o.toString()); } catch (Exception e) { return null; }
    }
}
