package com.ssafy.toktokggubi.domain.push.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.toktokggubi.domain.budget.repository.BudgetCategoryRepository;
import com.ssafy.toktokggubi.domain.budget.repository.UserMonthlyBudgetRepository;
import com.ssafy.toktokggubi.domain.notification.repository.NotificationRepository;
import com.ssafy.toktokggubi.domain.push.dto.ThresholdCheckResult;
import com.ssafy.toktokggubi.domain.transaction.entity.CardStatus;
import com.ssafy.toktokggubi.domain.transaction.entity.CardTransaction;
import com.ssafy.toktokggubi.domain.transaction.repository.CardTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.YearMonth;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryBudgetService {

    private final CardTransactionRepository txRepo;
    private final BudgetCategoryRepository budgetCategoryRepo;
    private final UserMonthlyBudgetRepository umbRepo;
    private final NotificationRepository notificationRepo;
    private final FcmService fcmService;
    private final ObjectMapper objectMapper;

    private static final ZoneId KST = ZoneId.of("Asia/Seoul");
    private static final DateTimeFormatter YM = DateTimeFormatter.ofPattern("yyyyMM");
    private static final String TYPE_THRESHOLD = "BUDGET_THRESHOLD/CATEGORY/80";
    private static final String TYPE_EXCEED = "BUDGET_EXCEED/CATEGORY/100";

    // =========================================
    // 80% 임계 알림
    // =========================================
    @Transactional
    public ThresholdCheckResult checkAndMaybeNotifyForCurrentMonth(String transactionUniqueNo) {
        return handleThreshold(transactionUniqueNo, 0.8, TYPE_THRESHOLD,
                "카테고리 예산 80% 임계",
                "이달 예산 %,d원 중 %,d원 사용 (%.1f%%) · %,d원 남음");
    }

    // =========================================
    // 100% 초과 알림
    // =========================================
    @Transactional
    public ThresholdCheckResult checkAndNotifyIfExceeded(String transactionUniqueNo) {
        return handleThreshold(transactionUniqueNo, 1.0, TYPE_EXCEED,
                "카테고리 예산 초과",
                "이달 예산 %,d원을 초과했습니다. 총 사용액: %,d원 (%.1f%%)");
    }



    // =========================================
    // 내부 공통 로직
    // =========================================
    private ThresholdCheckResult handleThreshold(
            String transactionUniqueNo,
            double thresholdRate,
            String typeKey,
            String title,
            String bodyFormat
    ) {
        // 1) 거래 조회
        CardTransaction tx = txRepo.findByTransactionUniqueNo(transactionUniqueNo).orElse(null);
        if (tx == null) {
            log.warn("[{}] 거래를 찾을 수 없음: {}", typeKey, transactionUniqueNo);
            return new ThresholdCheckResult(false, null, null, currentYm(), 0L, 0L, false);
        }

        Long userId = tx.getUser().getUserId();
        long categoryId = tx.getMerchant().getCategory().getCategoryId();

        // 2) 현재 달 계산
        YearMonth ym = YearMonth.now(KST);
        String budgetYm = ym.format(YM);
        String ymStart = budgetYm + "01";


        // 3) 누적 사용액
        long used = txRepo.sumByUserMonthAndCategory(
                userId, ymStart,  categoryId, CardStatus.APPROVED
        );

        // 4) 예산 조회
        Long finalAmount = budgetCategoryRepo.findFinalAmountByUserYmAndCategory(userId, budgetYm, categoryId);
        if (finalAmount == null || finalAmount <= 0) {
            log.info("[{}] 예산 미설정: user={}, ym={}, category={}", typeKey, userId, budgetYm, categoryId);
            return new ThresholdCheckResult(false, userId, String.valueOf(categoryId), budgetYm, used, finalAmount, false);
        }

        // 5) 비율 계산
        double rate = used * 1.0 / finalAmount;
        if (rate < thresholdRate) {
            return new ThresholdCheckResult(false, userId, String.valueOf(categoryId), budgetYm, used, finalAmount, false);
        }

        // 6) 중복 발송 방지
        boolean already = notificationRepo.existsComposite(userId, typeKey, budgetYm, String.valueOf(categoryId));
        if (already) {
            return new ThresholdCheckResult(true, userId, String.valueOf(categoryId), budgetYm, used, finalAmount, false);
        }

        // 7) 알림 전송
        double percent = Math.min(rate * 100.0, 999.9);
        long remaining = Math.max(finalAmount - used, 0);
        String body = String.format(bodyFormat, finalAmount, used, percent, remaining);
        String link = "toktokggubi://budget/overview?ym=" + budgetYm;

        fcmService.sendToUser(userId, title, body, link);

        // 8) 로그 저장
        String payloadJson = toJsonSafe(Map.of(
                "budgetYm", budgetYm,
                "categoryId", String.valueOf(categoryId),
                "used", used,
                "finalAmount", finalAmount,
                "percent", percent,
                "link", link
        ));

        notificationRepo.insertLog(userId, typeKey, title, body, payloadJson, budgetYm, String.valueOf(categoryId));

        return new ThresholdCheckResult(true, userId, String.valueOf(categoryId), budgetYm, used, finalAmount, true);
    }

    // ---- helpers ----
    private String currentYm() { return YearMonth.now(KST).format(YM); }
    private String toJsonSafe(Object o) { try { return objectMapper.writeValueAsString(o); } catch (Exception e) { return null; } }
}
