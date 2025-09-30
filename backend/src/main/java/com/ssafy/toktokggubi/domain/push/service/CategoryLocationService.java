package com.ssafy.toktokggubi.domain.push.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.toktokggubi.domain.budget.repository.BudgetCategoryRepository;
import com.ssafy.toktokggubi.domain.category.repository.CategoryRepository;
import com.ssafy.toktokggubi.domain.gms.service.GmsTextService;
import com.ssafy.toktokggubi.domain.notification.repository.NotificationRepository;
import com.ssafy.toktokggubi.domain.push.dto.PushType;
import com.ssafy.toktokggubi.domain.push.dto.ThresholdCheckResponse;
import com.ssafy.toktokggubi.domain.transaction.entity.CardStatus;
import com.ssafy.toktokggubi.domain.transaction.repository.CardTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
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
public class CategoryLocationService {

    private static final ZoneId KST = ZoneId.of("Asia/Seoul");
    private static final DateTimeFormatter YM = DateTimeFormatter.ofPattern("yyyyMM", Locale.KOREA);
    private static final String TYPE = "LOCATION";
    private static final String SCOPE = "CATEGORY";
    private final CardTransactionRepository txRepo;
    private final BudgetCategoryRepository budgetCategoryRepo;
    private final NotificationRepository notificationRepo;
    private final FcmService fcmService;
    private final ObjectMapper objectMapper;
    private final Optional<GmsTextService> gmsTextService; // GMS(Optional)
    private final CategoryRepository categoryRepository;   // 카테고리명 조회

    @Transactional
    public ThresholdCheckResponse notifyRemainForCategory(Long userId, Long categoryId) {
        if (userId == null || categoryId == null) {
            return new ThresholdCheckResponse(false, userId, categoryId, SCOPE, currentYm(), 0L, 0L, false);
        }

        // 이번 달 / 남은 일수
        YearMonth ym = YearMonth.now(KST);
        String budgetYm = ym.format(YM);
        int daysLeft = ym.atEndOfMonth().getDayOfMonth() - LocalDate.now(KST).getDayOfMonth();
        if (daysLeft < 0) daysLeft = 0;

        // 누적 사용액 / 최종 예산
        long used = txRepo.sumByUserMonthAndCategory(userId, budgetYm, categoryId, CardStatus.APPROVED);
        Long finalAmount = budgetCategoryRepo.findFinalAmountByUserYmAndCategory(userId, budgetYm, categoryId);

        if (finalAmount == null || finalAmount <= 0) {
            // 예산 미설정: 푸시 X
            return new ThresholdCheckResponse(false, userId, categoryId, SCOPE, budgetYm, used, finalAmount, false);
        }

        long remaining = finalAmount - used;
        boolean exceeded = remaining <= 0;
        double percent = Math.min((used * 100.0) / Math.max(finalAmount, 1L), 999.9);

        // 카테고리명
        String categoryName = resolveCategoryName(categoryId);

        // 동적 타이틀
        String title = exceeded
                ? String.format(Locale.KOREA, "%s 깜짝 소비 제안", categoryName)
                : String.format(Locale.KOREA, "%s 소소한 소비 제안", categoryName);

        // ───────────── 바디(GMS) ─────────────
        GmsTextService svc = gmsTextService.orElse(null);

        String body;
        if (svc != null) {
            long remainingSafe = Math.max(remaining, 0);

            if (exceeded) {
                // 초과: 숫자 노출 없이 행동 코칭 한 줄
                body = svc.coachingFromNumbers(
                        PushType.BUDGET_EXCEEDED_CATEGORY,
                        categoryName,
                        finalAmount, used, percent, remainingSafe,
                        daysLeft);
            } else {
                // 남음: 남은 금액을 문장에 넣고 짧은 추천 한 줄
                body = svc.locationRemainBody(
                        remainingSafe,
                        categoryName,
                        daysLeft);
            }
        } else {
            // GMS 비활성/오류 시 폴백
            body = exceeded
                    ? "이번 주는 배달 대신 픽업 한 번만 도전해봐요 꺼비"
                    : String.format(Locale.KOREA,
                    "이번달 %s 예산 %,d원 남았어요—커피 정도는 추천 꺼비",
                    categoryName, Math.max(remaining, 0));
        }

        // 푸시 전송
        boolean sent = false;
        try {
            fcmService.sendToUser(userId, title, body);
            sent = true;
        } catch (Exception e) {
            log.warn("[CategoryLocation] FCM send failed user={}, cat={}", userId, categoryId, e);
        }

        // 로그 적재 (sent_at=NOW())
        String payloadJson = toJsonSafe(Map.of(
                "budgetYm", budgetYm,
                "scope", SCOPE,
                "categoryId", categoryId,
                "categoryName", categoryName,
                "usedAmount", used,
                "finalAmount", finalAmount,
                "remaining", Math.max(remaining, 0),
                "exceeded", exceeded
        ));
        notificationRepo.insertLog(userId, TYPE, title, body, payloadJson, LocalDateTime.now(KST));

        // 응답
        return new ThresholdCheckResponse(true, userId, categoryId, SCOPE, budgetYm, used, finalAmount, sent);
    }

    // ===== helpers =====
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

    private String resolveCategoryName(Long categoryId) {
        try {
            String name = categoryRepository.findNameById(categoryId);
            if (name != null && !name.isBlank()) return name;
        } catch (Exception ignore) {
        }
        return "카테고리";
    }
}
