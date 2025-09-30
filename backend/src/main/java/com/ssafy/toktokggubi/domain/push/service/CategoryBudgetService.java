package com.ssafy.toktokggubi.domain.push.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.toktokggubi.domain.budget.repository.BudgetCategoryRepository;
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

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryBudgetService {

    private static final ZoneId KST = ZoneId.of("Asia/Seoul");
    private static final DateTimeFormatter YM = DateTimeFormatter.ofPattern("yyyyMM", Locale.KOREA);
    // 풀키(중복방지/로그용)
    private static final String THRESHOLD = PushType.BUDGET_THRESHOLD_CATEGORY_80.code(); // "BUDGET_THRESHOLD/CATEGORY/80"
    private static final String EXCEEDED = PushType.BUDGET_EXCEEDED_CATEGORY.code();     // "BUDGET_EXCEEDED/CATEGORY"
    private static final String SCOPE = "CATEGORY";
    private final CardTransactionRepository txRepo;
    private final BudgetCategoryRepository budgetCategoryRepo;
    private final NotificationRepository notificationRepo;
    private final FcmService fcmService;
    private final ObjectMapper objectMapper;
    private final Optional<GmsTextService> gmsTextService;

    @Transactional
    public ThresholdCheckResponse checkThreshold(String transactionUniqueNo) throws Exception {
        return handleThreshold(
                transactionUniqueNo,
                0.8,
                THRESHOLD,
                "%s 예산 80%% 임계",
                "이달 예산 %,d원 중 %,d원 사용 (%.1f%%) · %,d원 남음"
        );
    }

    @Transactional
    public ThresholdCheckResponse checkExceed(String transactionUniqueNo) throws Exception {
        return handleThreshold(
                transactionUniqueNo,
                1.0,
                EXCEEDED,
                "%s 예산 초과",
                "이달 예산 %,d원을 초과했습니다. 총 사용액: %,d원 (%.1f%%)"
        );
    }

    private ThresholdCheckResponse handleThreshold(
            String transactionUniqueNo,
            double thresholdRate,
            String typeKeyFull,     // 풀키(중복방지/로그용)
            String titleTemplate,
            String bodyFormat
    ) throws Exception {

        CardTransaction tx = txRepo.findByTransactionUniqueNo(transactionUniqueNo).orElse(null);
        if (tx == null) {
            log.warn("[{}] 거래를 찾을 수 없음: {}", typeKeyFull, transactionUniqueNo);
            return new ThresholdCheckResponse(false, null, null, SCOPE, currentYm(), 0L, 0L, false);
        }

        Long userId = tx.getUser().getUserId();
        var category = tx.getMerchant().getCategory();
        Long categoryId = category.getCategoryId();

        String categoryName;
        try {
            categoryName = category.getName();
        } catch (Exception ignore) {
            categoryName = null;
        }
        if (categoryName == null || categoryName.isBlank()) categoryName = "카테고리#" + categoryId;

        YearMonth ym = YearMonth.now(KST);
        String budgetYm = ym.format(YM);

        long used = txRepo.sumByUserMonthAndCategory(userId, budgetYm, categoryId, CardStatus.APPROVED);

        Long finalAmount = budgetCategoryRepo.findFinalAmountByUserYmAndCategory(userId, budgetYm, categoryId);

        if (finalAmount == null || finalAmount <= 0) {
            log.info("[{}] 예산 미설정: user={}, ym={}, category={}", typeKeyFull, userId, budgetYm, categoryId);
            return new ThresholdCheckResponse(false, userId, categoryId, SCOPE, budgetYm, used, finalAmount, false);
        }

        double rate = used * 1.0 / finalAmount;
        if (rate < thresholdRate) {
            return new ThresholdCheckResponse(false, userId, categoryId, SCOPE, budgetYm, used, finalAmount, false);
        }
        String typeKey = typeKeyFull + "#CAT:" + categoryId;
        // 월 범위 계산
        LocalDateTime monthFrom = ym.atDay(1).atStartOfDay();
        LocalDateTime monthTo = ym.plusMonths(1).atDay(1).atStartOfDay();

        // ── EXCEEDED 우선 정책: THRESHOLD 호출인데 이미 100% 이상이면 스킵
        if (THRESHOLD.equals(typeKeyFull) && rate >= 1.0) {
            return new ThresholdCheckResponse(false, userId, categoryId, SCOPE, budgetYm, used, finalAmount, false);
        }

        // ── THRESHOLD 호출인데 같은 달에 EXCEEDED/CATEGORY가 이미 있으면 스킵
        if (THRESHOLD.equals(typeKeyFull)) {
            long exceededDup = notificationRepo.countByUserTypeAndPeriod(userId, EXCEEDED, monthFrom, monthTo);
            if (exceededDup > 0) {
                return new ThresholdCheckResponse(false, userId, categoryId, SCOPE, budgetYm, used, finalAmount, false);
            }
        }


        long dup = notificationRepo.countByUserTypeAndPeriod(userId, typeKey, monthFrom, monthTo);
//        if (dup > 0) {
//            return new ThresholdCheckResponse(true, userId, categoryId, SCOPE, budgetYm, used, finalAmount, false);
//        }

        double percent = Math.min(rate * 100.0, 999.9);
        long remaining = Math.max(finalAmount - used, 0);

        int today = LocalDateTime.now(KST).getDayOfMonth();
        int daysLeft = Math.max(ym.lengthOfMonth() - today, 0);

        final boolean exceededNow = (thresholdRate >= 1.0);
        PushType pushType = exceededNow
                ? PushType.BUDGET_EXCEEDED_CATEGORY
                : PushType.BUDGET_THRESHOLD_CATEGORY_80;

        // 폴백들
        String tipFallback = "다음엔 카페 대신 믹스커피로 작게 즐겨봐요 꺼비";
        String numericExceededFallback = String.format(
                Locale.KOREA,
                "이번 달 %s 예산 중 %,d원 초과되었습니다. 티끌 모아 태산 꺼비",
                categoryName,
                Math.max(used - finalAmount, 0)
        );

        String body;
        if (gmsTextService.isPresent()) {
            try {
                // ★ 인자 순서 고정: (type, category, final, used, remaining, percent, daysLeft)
                body = gmsTextService.get().wittyCategoryBudgetBody(
                        pushType,
                        categoryName,
                        finalAmount,
                        used,
                        remaining,     // <-- remaining이 5번째
                        percent,       // <-- percent는 double 그대로 6번째
                        daysLeft
                );

                if (body == null || body.isBlank()) {
                    body = exceededNow ? numericExceededFallback : tipFallback;
                }
            } catch (Exception e) {
                log.warn("[GMS] wittyCategoryBudgetBody fail", e);
                body = exceededNow ? numericExceededFallback : tipFallback;
            }
        } else {
            body = exceededNow ? numericExceededFallback : tipFallback;
        }
        String title = String.format(Locale.KOREA, titleTemplate, categoryName);

        // 전송
        fcmService.sendToUser(userId, title, body);

        // 로그(INSERT는 scope 불필요 — type만 풀키로 저장)
        String payloadJson = toJsonSafe(Map.of(
                "budgetYm", budgetYm,
                "scope", "CATEGORY",
                "categoryId", categoryId,
                "categoryName", categoryName,
                "usedAmount", used,
                "finalAmount", finalAmount,
                "percent", percent
        ));
        notificationRepo.insertLog(userId, typeKey, title, body, payloadJson, LocalDateTime.now(KST));

        return new ThresholdCheckResponse(true, userId, categoryId, SCOPE, budgetYm, used, finalAmount, true);
    }

    private String currentYm() {
        return YearMonth.now(KST).format(YM);
    }

    private String toJsonSafe(Object o) {
        try {
            return objectMapper.writeValueAsString(o);
        } catch (Exception e) {
            return null;
        }
    }
}
