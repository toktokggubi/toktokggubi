// CategoryLocationService.java
package com.ssafy.toktokggubi.domain.push.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.toktokggubi.domain.budget.repository.BudgetCategoryRepository;
import com.ssafy.toktokggubi.domain.notification.repository.NotificationRepository;
import com.ssafy.toktokggubi.domain.push.dto.PushType;
import com.ssafy.toktokggubi.domain.push.dto.ThresholdCheckResponse;
import com.ssafy.toktokggubi.domain.transaction.entity.CardStatus;
import com.ssafy.toktokggubi.domain.transaction.repository.CardTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.YearMonth;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryLocationService {

    private final CardTransactionRepository txRepo;
    private final BudgetCategoryRepository budgetCategoryRepo;
    private final NotificationRepository notificationRepo;
    private final FcmService fcmService;
    private final ObjectMapper objectMapper;

    private static final ZoneId KST = ZoneId.of("Asia/Seoul");
    private static final DateTimeFormatter YM = DateTimeFormatter.ofPattern("yyyyMM", Locale.KOREA);

    private static final String TYPE = "LOCATION";
    private static final String SCOPE = "CATEGORY";

    @Transactional
    public ThresholdCheckResponse notifyRemainForCategory(Long userId, Long categoryId) throws Exception {
        if (userId == null || categoryId == null) {
            return new ThresholdCheckResponse(false, userId, categoryId, SCOPE, currentYm(), 0L, 0L, false);
        }

        // 이번 달 키
        YearMonth ym = YearMonth.now(KST);
        String budgetYm = ym.format(YM);

        // 누적 사용액 / 최종 예산
        long used = txRepo.sumByUserMonthAndCategory(userId, budgetYm, categoryId, CardStatus.APPROVED);
        Long finalAmount = budgetCategoryRepo.findFinalAmountByUserYmAndCategory(userId, budgetYm, categoryId);

        if (finalAmount == null || finalAmount <= 0) {
            // 예산 미설정: 푸시 X, 응답만
            return new ThresholdCheckResponse(false, userId, categoryId, SCOPE, budgetYm, used, finalAmount, false);
        }

        long remaining = finalAmount - used;
        boolean exceeded = remaining <= 0;

        // 타이틀/바디 구성 (자제 요청 톤)
        String title;
        String body;
        if (exceeded) {
            long over = Math.abs(remaining);
            title = "카테고리 예산 초과";
            body  = String.format(Locale.KOREA,
                    "이번달 예산 %,d원을 초과했어요. 총 사용액 %,d원 (초과 %,d원)",
                    finalAmount, used, over);
        } else {
            double percent = Math.min((used * 100.0) / finalAmount, 999.9);
            title = "카테고리 예산 남은 금액 안내";
            body  = String.format(Locale.KOREA,
                    "이번달 예산 %,d원 중 %,d원 사용 (%.1f%%) · 초과까지 아직 %,d원 남았어요",
                    finalAmount, used, percent, remaining);
        }

        // 푸시 전송
        boolean sent = false;
        try {
            fcmService.sendToUser(userId, title, body); // 링크 없는 시그니처
            sent = true;
        } catch (Exception e) {
            log.warn("[CategoryLocation] FCM send failed user={}, cat={}", userId, categoryId, e);
        }

        // 로그 적재 (budget_ym 컬럼 없으므로 payload_json에 담고, sent_at=NOW())
        String payloadJson = toJsonSafe(Map.of(
                "budgetYm", budgetYm,
                "scope", SCOPE,
                "categoryId", categoryId,
                "usedAmount", used,
                "finalAmount", finalAmount,
                "remaining", Math.max(remaining, 0),
                "exceeded", exceeded
        ));
        notificationRepo.insertLog(userId, TYPE, title, body, payloadJson);

        // 응답 (ThresholdCheckResponse 재활용)
        return new ThresholdCheckResponse(true, userId, categoryId, SCOPE, budgetYm, used, finalAmount, sent);
    }

    private String currentYm() { return YearMonth.now(KST).format(YM); }

    private String toJsonSafe(Object o) {
        try { return objectMapper.writeValueAsString(o); }
        catch (Exception e) { return null; }
    }
}
