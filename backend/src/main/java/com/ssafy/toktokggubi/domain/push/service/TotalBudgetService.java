package com.ssafy.toktokggubi.domain.push.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.toktokggubi.domain.budget.repository.UserMonthlyBudgetRepository;
import com.ssafy.toktokggubi.domain.gms.service.GmsTextService;
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
import java.util.Optional;

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
    private final Optional<GmsTextService> gmsTextService;
    private static final String THRESHOLD = PushType.BUDGET_THRESHOLD_TOTAL_80.code(); // "BUDGET_THRESHOLD/TOTAL/80"
    private static final String EXCEED    = PushType.BUDGET_EXCEEDED_TOTAL.code();     // "BUDGET_EXCEEDED/TOTAL"
    private static final String SCOPE         = "TOTAL";

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
            String typeKeyFull,     // 풀키(중복방지/로그용)
            String title,
            String bodyFormat,
            boolean includeRemaining
    ) throws Exception {
        CardTransaction tx = txRepo.findByTransactionUniqueNo(txNo).orElse(null);
        if (tx == null) {
            log.warn("[{}] 거래 없음: {}", typeKeyFull, txNo);
            return new ThresholdCheckResponse(false, null, null, SCOPE, currentYm(), 0L, 0L, false);
        }

        Long userId = tx.getUser().getUserId();
        YearMonth ym = YearMonth.now(KST);
        String budgetYm = ym.format(YM);


        long used = txRepo.sumByUserMonth(userId, budgetYm, CardStatus.APPROVED);
        Long totalBudget = umbRepo.findFinalTotalAmount(userId, budgetYm);

        if (totalBudget == null || totalBudget <= 0) {
            return new ThresholdCheckResponse(false, userId, null, SCOPE, budgetYm, used, totalBudget, false);
        }

        double rate = used * 1.0 / totalBudget;
        if (rate < thresholdRate) {
            return new ThresholdCheckResponse(false, userId, null, SCOPE, budgetYm, used, totalBudget, false);
        }

        LocalDateTime monthFrom = ym.atDay(1).atStartOfDay();
        LocalDateTime monthTo   = ym.plusMonths(1).atDay(1).atStartOfDay();

        if (THRESHOLD.equals(typeKeyFull) && rate >= 1.0) {
            return new ThresholdCheckResponse(false, userId, null, SCOPE, budgetYm, used, totalBudget, false);
        }

        if (THRESHOLD.equals(typeKeyFull)) {
            long exceedDup = notificationRepo.countByUserTypeAndPeriod(
                    userId, EXCEED, monthFrom, monthTo
            );
            if (exceedDup > 0) {
                return new ThresholdCheckResponse(false, userId, null, SCOPE, budgetYm, used, totalBudget, false);
            }
        }
        String typeKey = typeKeyFull; // TOTAL은 추가 식별자 불필요

        long dup = notificationRepo.countByUserTypeAndPeriod(userId, typeKey, monthFrom, monthTo);
//        if (dup > 0) {
//            return new ThresholdCheckResponse(true, userId, null, SCOPE, budgetYm, used, totalBudget, false);
//        }

        double percent = Math.min(rate * 100.0, 999.9);
        long remaining = Math.max(totalBudget - used, 0);

        PushType pushType = (thresholdRate >= 1.0)
                ? PushType.BUDGET_EXCEEDED_TOTAL
                : PushType.BUDGET_THRESHOLD_TOTAL_80;

        String defaultBody = includeRemaining
                ? String.format(Locale.KOREA, bodyFormat, totalBudget, used, percent, remaining)
                : String.format(Locale.KOREA, bodyFormat, totalBudget, used, percent);

        String body = gmsTextService
                .map(svc -> svc.wittyBudgetBody(pushType, totalBudget, used, percent, remaining))
                .orElse(defaultBody);

        fcmService.sendToUser(userId, title, body);

        String payloadJson = toJsonSafe(Map.of(
                "budgetYm", budgetYm,
                "scope", "TOTAL",
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
