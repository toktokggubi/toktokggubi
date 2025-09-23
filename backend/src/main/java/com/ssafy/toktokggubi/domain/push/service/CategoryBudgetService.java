// src/main/java/com/ssafy/toktokggubi/domain/push/service/CategoryBudgetService.java
package com.ssafy.toktokggubi.domain.push.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.toktokggubi.domain.budget.repository.BudgetCategoryRepository;
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

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryBudgetService {

    private final CardTransactionRepository txRepo;
    private final BudgetCategoryRepository budgetCategoryRepo;
    private final NotificationRepository notificationRepo;
    private final FcmService fcmService;
    private final ObjectMapper objectMapper;

    private static final ZoneId KST = ZoneId.of("Asia/Seoul");
    private static final DateTimeFormatter YM = DateTimeFormatter.ofPattern("yyyyMM", Locale.KOREA);

    private static final String THRESHOLD = PushType.BUDGET_THRESHOLD_CATEGORY_80.code(); // "BUDGET_THRESHOLD/CATEGORY/80"
    private static final String EXCEEDED  = PushType.BUDGET_EXCEEDED_CATEGORY.code();     // "BUDGET_EXCEEDED/CATEGORY"
    private static final String SCOPE = "CATEGORY";

    @Transactional
    public ThresholdCheckResponse checkThreshold(String transactionUniqueNo) throws Exception {
        return handleThreshold(
                transactionUniqueNo,
                0.8,
                THRESHOLD,
                "%s 예산 80%% 임계", // 제목 템플릿 (카테고리명 포함)
                "이달 예산 %,d원 중 %,d원 사용 (%.1f%%) · %,d원 남음"
        );
    }

    /** 100% 초과 알림 */
    @Transactional
    public ThresholdCheckResponse checkExceed(String transactionUniqueNo) throws Exception {
        return handleThreshold(
                transactionUniqueNo,
                1.0,
                EXCEEDED,
                "%s 예산 초과", // 제목 템플릿
                "이달 예산 %,d원을 초과했습니다. 총 사용액: %,d원 (%.1f%%)"
        );
    }

    // ================= 내부 공통 로직 =================
    private ThresholdCheckResponse handleThreshold(
            String transactionUniqueNo,
            double thresholdRate,
            String baseTypeKey,
            String titleTemplate,   // 제목 템플릿("%s ...")
            String bodyFormat
    ) throws Exception {
        CardTransaction tx = txRepo.findByTransactionUniqueNo(transactionUniqueNo).orElse(null);
        if (tx == null) {
            log.warn("[{}] 거래를 찾을 수 없음: {}", baseTypeKey, transactionUniqueNo);
            return new ThresholdCheckResponse(false, null, null, SCOPE, currentYm(), 0L, 0L, false);
        }

        Long userId = tx.getUser().getUserId();
        var category = tx.getMerchant().getCategory();
        Long categoryId = category.getCategoryId();

        // 안전하게 카테고리명 확보(없으면 ID로 대체)
        String categoryName = null;
        try {
            // 엔티티 필드명에 맞춰 수정(getCategoryName / getName 중 실제 있는 메서드 사용)
            categoryName = category.getName();
        } catch (Exception ignore) {}
        if (categoryName == null || categoryName.isBlank()) {
            categoryName = "카테고리#" + categoryId;
        }

        YearMonth ym = YearMonth.now(KST);
        String budgetYm = ym.format(YM);
        String ymStart = budgetYm + "01";

        long used = txRepo.sumByUserMonthAndCategory(userId, ymStart, categoryId, CardStatus.APPROVED);
        Long finalAmount = budgetCategoryRepo.findFinalAmountByUserYmAndCategory(userId, budgetYm, categoryId);
        if (finalAmount == null || finalAmount <= 0) {
            log.info("[{}] 예산 미설정: user={}, ym={}, category={}", baseTypeKey, userId, budgetYm, categoryId);
            return new ThresholdCheckResponse(false, userId, categoryId, SCOPE, budgetYm, used, finalAmount, false);
        }

        double rate = used * 1.0 / finalAmount;
        if (rate < thresholdRate) {
            return new ThresholdCheckResponse(false, userId, categoryId, SCOPE, budgetYm, used, finalAmount, false);
        }

        String typeKey = baseTypeKey + "#CAT:" + categoryId;
        LocalDateTime monthFrom = ym.atDay(1).atStartOfDay();
        LocalDateTime monthTo   = ym.plusMonths(1).atDay(1).atStartOfDay();
        boolean already = notificationRepo.existsByUserTypeInMonth(userId, typeKey, monthFrom, monthTo);
        if (already) {
            return new ThresholdCheckResponse(true, userId, categoryId, SCOPE, budgetYm, used, finalAmount, false);
        }

        double percent = Math.min(rate * 100.0, 999.9);
        long remaining = Math.max(finalAmount - used, 0);
        String body = String.format(Locale.KOREA, bodyFormat, finalAmount, used, percent, remaining);

        // 카테고리명을 끼운 동적 제목
        String title = String.format(Locale.KOREA, titleTemplate, categoryName);

        // 실제 발송
        fcmService.sendToUser(userId, title, body);

        // 로그 저장 (DB 스키마에 맞춘 payload — categoryId/Name은 payload로 남김)
        String payloadJson = toJsonSafe(Map.of(
                "budgetYm", budgetYm,
                "scope", SCOPE,
                "categoryId", categoryId,
                "categoryName", categoryName,
                "usedAmount", used,
                "finalAmount", finalAmount,
                "percent", percent
        ));
        notificationRepo.insertLog(userId, typeKey, title, body, payloadJson);

        return new ThresholdCheckResponse(true, userId, categoryId, SCOPE, budgetYm, used, finalAmount, true);
    }

    // ---- helpers ----
    private String currentYm() { return YearMonth.now(KST).format(YM); }

    private String toJsonSafe(Object o) {
        try { return objectMapper.writeValueAsString(o); }
        catch (Exception e) { return null; }
    }
}
