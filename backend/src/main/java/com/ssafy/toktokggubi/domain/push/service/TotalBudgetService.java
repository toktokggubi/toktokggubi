// src/main/java/com/ssafy/toktokggubi/domain/push/service/TotalBudgetService.java
package com.ssafy.toktokggubi.domain.push.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.toktokggubi.domain.budget.repository.UserMonthlyBudgetRepository;
import com.ssafy.toktokggubi.domain.notification.repository.NotificationRepository;
import com.ssafy.toktokggubi.domain.push.dto.PushType;
import com.ssafy.toktokggubi.domain.push.dto.ThresholdCheckResponse;
import com.ssafy.toktokggubi.domain.transaction.entity.CardStatus;
import com.ssafy.toktokggubi.domain.transaction.entity.CardTransaction;
import com.ssafy.toktokggubi.domain.transaction.repository.CardTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class TotalBudgetService {

    private final CardTransactionRepository txRepo;
    private final UserMonthlyBudgetRepository umbRepo;
    private final NotificationRepository notificationRepo;
    private final FcmService fcmService;
    private final ObjectMapper objectMapper;

    private static final ZoneId KST = ZoneId.of("Asia/Seoul");
    private static final DateTimeFormatter YM = DateTimeFormatter.ofPattern("yyyyMM", Locale.KOREA);

    private static final String THRESHOLD = PushType.BUDGET_THRESHOLD_TOTAL_80.code();
    private static final String EXCEED    = PushType.BUDGET_EXCEEDED_TOTAL.code();
    private static final String SCOPE     = "TOTAL";

    @Transactional
    public ThresholdCheckResponse checkThreshold(String txNo) throws Exception {
        return handleTotal(
                txNo, 0.8, THRESHOLD,
                "전체 예산 80% 임계",
                "이번달 전체 예산 %,d원 중 %,d원 사용 (%.1f%%) · %,d원 남음",
                true
        );
    }

    @Transactional
    public ThresholdCheckResponse checkExceed(String txNo) throws Exception {
        return handleTotal(
                txNo, 1.0, EXCEED,
                "전체 예산 초과",
                "이번달 전체 예산 %,d원을 초과했습니다. 총 사용액: %,d원 (%.1f%%)",
                false
        );
    }

    private ThresholdCheckResponse handleTotal(
            String txNo,
            double thresholdRate,
            String typeKey,
            String title,
            String bodyFormat,
            boolean includeRemaining
    ) throws Exception {
        CardTransaction tx = txRepo.findByTransactionUniqueNo(txNo).orElse(null);
        if (tx == null) {
            log.warn("[{}] 거래 없음: {}", typeKey, txNo);
            return new ThresholdCheckResponse(false, null, null, SCOPE, currentYm(), 0L, 0L, false);
        }

        Long userId = tx.getUser().getUserId();
        YearMonth ym = YearMonth.now(KST);
        String budgetYm = ym.format(YM);
        String ymStart = budgetYm + "01";

        long used = txRepo.sumByUserMonth(userId, ymStart, CardStatus.APPROVED);
        Long totalBudget = umbRepo.findFinalTotalAmount(userId, budgetYm);

        if (totalBudget == null || totalBudget <= 0) {
            // 전체 예산 미설정
            return new ThresholdCheckResponse(false, userId, null, SCOPE, budgetYm, used, totalBudget, false);
        }

        double rate = used * 1.0 / totalBudget;
        if (rate < thresholdRate) {
            // 임계 미도달
            return new ThresholdCheckResponse(false, userId, null, SCOPE, budgetYm, used, totalBudget, false);
        }

        // ==== 중복 발송 방지: 이번 달 범위 + type ====
        LocalDateTime monthFrom = ym.atDay(1).atStartOfDay();
        LocalDateTime monthTo   = ym.plusMonths(1).atDay(1).atStartOfDay();
        boolean already = notificationRepo.existsByUserTypeInMonth(userId, typeKey, monthFrom, monthTo);
        if (already) {
            return new ThresholdCheckResponse(true, userId, null, SCOPE, budgetYm, used, totalBudget, false);
        }

        double percent = Math.min(rate * 100.0, 999.9);
        long remaining = Math.max(totalBudget - used, 0);

        String body = includeRemaining
                ? String.format(Locale.KOREA, bodyFormat, totalBudget, used, percent, remaining)
                : String.format(Locale.KOREA, bodyFormat, totalBudget, used, percent);

        // 실제 전송
        fcmService.sendToUser(userId, title, body);

        // 로그 저장 (payload에 컨텍스트만 남김)
        String payloadJson = toJsonSafe(Map.of(
                "budgetYm", budgetYm,
                "scope", SCOPE,
                "usedAmount", used,
                "finalAmount", totalBudget,
                "percent", percent
        ));
        notificationRepo.insertLog(userId, typeKey, title, body, payloadJson);

        return new ThresholdCheckResponse(true, userId, null, SCOPE, budgetYm, used, totalBudget, true);
    }

    private String currentYm() { return YearMonth.now(KST).format(YM); }

    private String toJsonSafe(Object o) {
        try { return objectMapper.writeValueAsString(o); }
        catch (Exception e) { return null; }
    }
}
