package com.ssafy.toktokggubi.domain.push.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.toktokggubi.domain.budget.repository.UserMonthlyBudgetRepository;
import com.ssafy.toktokggubi.domain.notification.repository.NotificationRepository;
import com.ssafy.toktokggubi.domain.push.dto.ThresholdCheckResult;
import com.ssafy.toktokggubi.domain.transaction.entity.CardStatus;
import com.ssafy.toktokggubi.domain.transaction.entity.CardTransaction;
import com.ssafy.toktokggubi.domain.transaction.repository.CardTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.YearMonth;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class TotalBudgetService {

    private final CardTransactionRepository txRepo;
    private final UserMonthlyBudgetRepository umbRepo;
    private final NotificationRepository notificationRepo;
    private final FcmService fcmService;        // FCM 사용 안 하면 제거해도 됨
    private final ObjectMapper objectMapper;

    private static final ZoneId KST = ZoneId.of("Asia/Seoul");
    private static final DateTimeFormatter YM = DateTimeFormatter.ofPattern("yyyyMM");

    private static final String TYPE_THRESHOLD = "BUDGET_THRESHOLD/TOTAL/80";
    private static final String TYPE_EXCEED    = "BUDGET_EXCEED/TOTAL/100";

    public ThresholdCheckResult checkThreshold(String txNo) {
        return handleTotal(txNo, 0.8, TYPE_THRESHOLD,
                "전체 예산 80% 임계",
                "이번달 전체 예산 %,d원 중 %,d원 사용 (%.1f%%) · %,d원 남음",
                true);
    }

    public ThresholdCheckResult checkExceed(String txNo) {
        return handleTotal(txNo, 1.0, TYPE_EXCEED,
                "전체 예산 초과",
                "이번달 전체 예산 %,d원을 초과했습니다. 총 사용액: %,d원 (%.1f%%)",
                false);
    }

    private ThresholdCheckResult handleTotal(
            String txNo,
            double thresholdRate,
            String typeKey,
            String title,
            String bodyFormat,
            boolean includeRemaining
    ) {
        CardTransaction tx = txRepo.findByTransactionUniqueNo(txNo).orElse(null);
        if (tx == null) {
            log.warn("[{}] 거래 없음: {}", typeKey, txNo);
            return new ThresholdCheckResult(false, null, "TOTAL", currentYm(), 0L, 0L, false);
        }

        Long userId = tx.getUser().getUserId();
        YearMonth ym = YearMonth.now(KST);
        String budgetYm = ym.format(YM);
        String ymStart = budgetYm + "01";

        long used = txRepo.sumByUserMonth(userId, ymStart, CardStatus.APPROVED);
        Long totalBudget = umbRepo.findFinalTotalAmount(userId, budgetYm);

        if (totalBudget == null || totalBudget <= 0) {
            return new ThresholdCheckResult(false, userId, "TOTAL", budgetYm, used, totalBudget, false);
        }

        double rate = used * 1.0 / totalBudget;
        if (rate < thresholdRate) {
            return new ThresholdCheckResult(false, userId, "TOTAL", budgetYm, used, totalBudget, false);
        }

        boolean already = notificationRepo.existsComposite(userId, typeKey, budgetYm, "TOTAL");
        if (already) {
            return new ThresholdCheckResult(true, userId, "TOTAL", budgetYm, used, totalBudget, false);
        }

        double percent = Math.min(rate * 100.0, 999.9);
        long remaining = Math.max(totalBudget - used, 0);

        // ✅ LLM 제거: fallback 메시지 그대로 사용
        String body = includeRemaining
                ? String.format(bodyFormat, totalBudget, used, percent, remaining)
                : String.format(bodyFormat, totalBudget, used, percent);

        String link = "toktokggubi://budget/overview?ym=" + budgetYm;

        // 필요 시 푸시 발송(현재 주석)
        // fcmService.sendToUser(userId, title, body, link);

        notificationRepo.insertLog(
                userId, typeKey, title, body,
                toJsonSafe(Map.of(
                        "budgetYm", budgetYm,
                        "scope", "TOTAL",
                        "used", used,
                        "finalAmount", totalBudget,
                        "percent", percent,
                        "link", link
                )),
                budgetYm, "TOTAL"
        );

        return new ThresholdCheckResult(true, userId, "TOTAL", budgetYm, used, totalBudget, true);
    }

    private String currentYm() { return YearMonth.now(KST).format(YM); }

    private String toJsonSafe(Object o) {
        try {
            return objectMapper.writeValueAsString(o);
        } catch (Exception e) {
            return null;
        }
    }
}
