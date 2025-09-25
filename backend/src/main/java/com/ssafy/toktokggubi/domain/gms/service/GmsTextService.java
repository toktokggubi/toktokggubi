package com.ssafy.toktokggubi.domain.gms.service;

import com.ssafy.toktokggubi.domain.push.dto.PushType;
import com.ssafy.toktokggubi.domain.gms.llm.LlmClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class GmsTextService {

    private final LlmClient llm;

    // =========================================================
    // 1) 역할 메서드 (Controller/Service에서 바로 호출)
    // =========================================================

    /** LOCATION: 남은 금액 + 짧은 추천(한 문장) */
    public String locationRemainBody(Long remaining, String categoryNameOrNull, int daysLeft) {
        String cat = (categoryNameOrNull == null || categoryNameOrNull.isBlank()) ? "" : categoryNameOrNull.trim();
        String prompt = buildLocationPrompt(Math.max(remaining == null ? 0 : remaining, 0), Math.max(daysLeft, 0), cat);

        try {
            String out = llm.complete(prompt, 80, 0.9);
            out = polishOneLiner(out, /*exceeded=*/false, /*maxLen=*/85);
            if (out.isBlank()) {
                return String.format(Locale.KOREA,
                        "이번달 %s예산 %,d원 남았어요—커피 정도는 추천 꺼비",
                        (cat.isBlank() ? "" : cat + " "), Math.max(remaining == null ? 0 : remaining, 0));
            }
            return out;
        } catch (Exception e) {
            log.warn("[GMS] locationRemainBody fail", e);
            return String.format(Locale.KOREA,
                    "이번달 %s예산 %,d원 남았어요—커피 정도는 추천 꺼비",
                    (cat.isBlank() ? "" : cat + " "), Math.max(remaining == null ? 0 : remaining, 0));
        }
    }

    /** 임계/초과: 숫자 미노출 코칭(카테고리 옵션) */
    public String coachingFromNumbers(
            PushType type,
            String categoryNameOrNull,
            long finalAmount, long usedAmount, double percent, long remaining,
            int daysLeftInMonth
    ) {
        boolean exceeded = isExceeded(type);
        String mood    = exceeded ? "예산을 넘겼습니다" : "80% 임계에 도달했습니다";
        String catLabel = (categoryNameOrNull == null || categoryNameOrNull.isBlank())
                ? "범용 코칭 관점" : "카테고리: " + categoryNameOrNull.trim();

        String prompt = buildCoachingPrompt(
                mood, catLabel,
                finalAmount, usedAmount, percent,
                Math.max(remaining, 0), Math.max(daysLeftInMonth, 0)
        );

        try {
            String out = llm.complete(prompt, 65, 0.9);
            out = polishOneLiner(out, /*exceeded=*/false, /*maxLen=*/65);
            return out.isBlank() ? fallbackCoaching(type) : out;
        } catch (Exception e) {
            log.warn("[GMS] coachingFromNumbers fail", e);
            return fallbackCoaching(type);
        }
    }

    /** 전체/카테고리 공통: 숫자 포함 한줄(초과는 고정 포맷+속담 1개, 임계는 LLM) */
    public String wittyBudgetBody(
            PushType type,
            long finalAmount, long usedAmount, double percent, long remaining
    ) {
        boolean exceeded = isExceeded(type);

        if (exceeded) {
            try {
                String body = composeExceededFixedStyle(finalAmount, usedAmount, /*categoryLabel*/ null);
                return polishOneLiner(body, /*exceeded=*/true, /*maxLen=*/65);
            } catch (Exception e) {
                log.warn("[GMS] exceeded compose fail", e);
                long overAmount = Math.max(usedAmount - finalAmount, 0);
                return String.format(Locale.KOREA,
                        "이번 달 예산 중 %,d원 더 썼어요. 티끌 모아 태산 꺼비",
                         overAmount);
            }
        }

        String prompt = buildThresholdPrompt(finalAmount, usedAmount, percent, remaining);
        try {
            String out = llm.complete(prompt, 65, 0.7);
            out = (out == null) ? "" : out.trim();
            if (out.isBlank()) {
                return String.format(Locale.KOREA,
                        "이번 달 예산 %,d원 중 %,d원 사용(%.1f%%), 남은 %,d원이에요 꺼비",
                        finalAmount, usedAmount, percent, remaining);
            }
            return polishOneLiner(out, /*exceeded=*/false, /*maxLen=*/65);
        } catch (Exception e) {
            log.warn("[GMS] wittyBudgetBody(80%%) fail", e);
            return String.format(Locale.KOREA,
                    "이번 달 예산 %,d원 중 %,d원 사용(%.1f%%), 남은 %,d원이에요 꺼비",
                    finalAmount, usedAmount, percent, remaining);
        }
    }

    /** 카테고리 전용: 초과=고정 포맷+속담1, 미초과=숫자없는 꿀팁 */
    public String wittyCategoryBudgetBody(
            PushType type,
            String categoryNameOrNull,
            long finalAmount, long usedAmount, long remaining, double percent,
            int daysLeft
    ) {
        final boolean exceeded = isExceeded(type);
        final String category = (categoryNameOrNull == null || categoryNameOrNull.isBlank())
                ? "카테고리" : categoryNameOrNull.trim();

        if (exceeded) {
            try {
                String body = composeExceededFixedStyle(finalAmount, usedAmount, category);
                return polishOneLiner(body, /*exceeded=*/false, /*maxLen=*/65);
            } catch (Exception e) {
                log.warn("[GMS] wittyCategoryBudgetBody(exceeded) compose fail", e);
                long overAmount = Math.max(usedAmount - finalAmount, 0L);
                return polishOneLiner(
                        String.format(Locale.KOREA,
                                "이번 달 예산 중 %,d원 더 썼어요. 티끌 모아 태산 꺼비",
                                category, overAmount),
                        /*exceeded=*/false, /*maxLen=*/65
                );
            }
        }

        String prompt = buildCategoryTipPrompt(category, Math.max(daysLeft, 0));
        try {
            String out = llm.complete(prompt, 85, 0.9);
            out = (out == null) ? "" : out.trim();
            if (out.isBlank()) {
                return polishOneLiner(
                        "무료 전시·도서관 대여로 " + category + "을(를) 가볍게 즐겨봐요",
                        /*exceeded=*/false, /*maxLen=*/85
                );
            }
            // 가드: 혹시 숫자 들어지면 제거
            out = out.replaceAll("\\d[\\d,]*(?:\\.\\d+)?\\s*[%원]?", "")
                    .replaceAll("\\s{2,}", " ").trim();

            return polishOneLiner(out, /*exceeded=*/false, /*maxLen=*/85);
        } catch (Exception e) {
            log.warn("[GMS] wittyCategoryBudgetBody(tip) fail", e);
            return polishOneLiner(
                    "무료 전시·도서관 대여로 " + category + "을(를) 가볍게 즐겨봐요",
                    /*exceeded=*/false, /*maxLen=*/85
            );
        }
    }

    // =========================================================
    // 2) 프롬프트 빌더
    // =========================================================

    private String buildLocationPrompt(long remaining, int daysLeft, String cat) {
        return """
            역할: 한국어로 간결하고 재치 있게 알림을 만드는 어시스턴트.
            상황: 월간 해당 카테고리 남은 금액 안내(LOCATION). 사용자는 지금 소비 결정을 고민 중.
            데이터:
            - 남은 금액: %,d원
            - 남은 일수: %d일
            - 카테고리: %s
            지시:
            - 하나의 문장(최대 85자)으로 '남은 금액' + 카테고리 맞춤 작은 추천을 함께.
            - 이모지 0~1개, 마크다운/따옴표/불릿 금지.
            - 자연스럽게 '꺼비'로 마무리.
            출력: 문장만.
            """.formatted(remaining, daysLeft, (cat == null || cat.isBlank()) ? "범용" : cat);
    }

    private String buildCoachingPrompt(
            String mood, String catLabel,
            long finalAmount, long usedAmount, double percent, long remainingSafe, int daysSafe
    ) {
        return String.format(Locale.KOREA, """
            역할: 한국어로 간결하고 재치 있는 소비 코치.
            상황: %s. %s
            [데이터 컨텍스트 - 출력에 숫자 쓰지 마]
            - 이달 예산: %,d원
            - 현재 사용: %,d원
            - 사용률: %.1f%%
            - 남은 금액: %,d원
            - 남은 일수: %d일
            지시:
            - 한 문장(≤65자), 마크다운/따옴표/불릿 금지, 이모지 0~1개.
            - 숫자/금액/퍼센트 언급 금지(행동 코칭만).
            - 카테고리가 있으면 해당 주제로 코칭.
            - '대체 행동' 또는 '빈도/양 조절' 제안.
            - 자연스럽게 '꺼비'로 마무리.
            출력: 문장만.
            """, mood, catLabel, finalAmount, usedAmount, percent, remainingSafe, daysSafe);
    }

    private String buildThresholdPrompt(long finalAmount, long usedAmount, double percent, long remaining) {
        return """
            상황: 예산 사용률이 80%% 임계에 도달했습니다. 부드럽게 환기하세요.
            데이터:
            - 이달 예산: %,d원
            - 현재 사용: %,d원
            - 사용률: %.1f%%
            - 남은 금액: %,d원
            출력 규칙:
            - 한국어 1문장, ≤65자, 이모지 0~1개
            - 마크다운/따옴표/불릿 금지
            - 숫자 값은 그대로 반영
            - 가능하면 자연스럽게 '꺼비'로 마무리
            """.formatted(finalAmount, usedAmount, percent, remaining);
    }

    private String buildCategoryTipPrompt(String category, int daysLeft) {
        return """
            상황: %s 예산은 아직 초과되지 않았거나 임계 도달 상태. 사용자는 가볍게 절약 팁을 원함.
            데이터:
            - 카테고리: %s
            - 남은 일수: %d일
            출력 규칙:
            - 한국어 1문장, ≤85자, 이모지 0~1개
            - 숫자/금액/퍼센트 언급 금지
            - 마크다운/따옴표/불릿 금지
            - 문장 끝에 자연스럽게 '꺼비'
            지시:
            - %s에 어울리는 작게 즐기기/대체/빈도조절 중 실천 가능한 팁 1가지로.
            - (예: 카페→테이크아웃/메뉴 다운사이징, 식비→밀프렙/배달 빈도 줄이기, 문화→무료 전시/도서관 대여 등)
            출력: 문장만.
            """.formatted(category, category, daysLeft, category);
    }

    // =========================================================
    // 3) LLM·속담 헬퍼
    // =========================================================

    /** 초과 본문: (전체) "이번 달 예산 X원 중 Y원 초과되었습니다. {속담} 꺼비" / (카테고리) 동일 포맷 */
    private String composeExceededFixedStyle(long finalAmount, long usedAmount, String categoryLabelOrNull) {
        long overAmount = Math.max(usedAmount - finalAmount, 0);
        String proverb  = pickProverbOrFallback(); // LLM or fallback

        if (categoryLabelOrNull == null || categoryLabelOrNull.isBlank()) {
            // 예: "이번 달 예산 중 123,456원 초과되었습니다. (속담) 꺼비"
            return String.format(Locale.KOREA,
                    "이번 달 예산 중 %,d원 초과되었습니다. %s 꺼비",
                    overAmount, proverb);
        } else {
            // 예: "이번 달 식비 예산 중 123,456원 초과되었습니다. (속담) 꺼비"
            return String.format(Locale.KOREA,
                    "이번 달 %s 예산 중 %,d원 초과되었습니다. %s 꺼비",
                    categoryLabelOrNull.trim(), overAmount, proverb);
        }
    }

    /** LLM에서 속담 1개만 받아오기(실패 시 로컬 폴백) */
    private String pickProverbOrFallback() {
        final String prompt = """
                역할: 한국어 절약/검소/지출 자제 관련 "속담 느낌" 한 줄을 만드는 창작자.
                목표: 알림 본문 끝에 붙여도 자연스러운, 짧고 간결한 "속담풍" 구절을 1개 생성한다.
                제약:
                - 길이: 6~14자(한글 기준), 가능한 한 간결하게.
                - 톤: 서술형·격려형 위주. 비난/명령/훈계 금지. 과격/모욕/설교 금지.
                - 내용: 절약·검소·지출 절제·낭비 방지·작은 노력의 축적 등과 관련.
                - 출력 형식: 본문만 출력.무조건 말투에 꺼비 붙이기 따옴표/마침표/줄바꿈/이모지/기호 금지. 숫자·통화기호 금지.
                - 다양성: 뻔한 관용구의 반복을 피하고 매 호출마다 새로운 표현을 우선한다.
                """;
        try {
            String out = llm.complete(prompt, 16, 0.7);
            String proverb = sanitizeProverb(out);
            return proverb.isBlank() ? pickFallbackProverb() : proverb;
        } catch (Exception e) {
            log.warn("[GMS] pickProverbOrFallback fail", e);
            return pickFallbackProverb();
        }
    }

    private String fallbackCoaching(PushType type) {
        return (type == PushType.BUDGET_EXCEEDED_TOTAL || type == PushType.BUDGET_EXCEEDED_CATEGORY)
                ? "이번 주는 배달 대신 픽업 한 번만 도전해봐요 꺼비"
                : "다음엔 카페 대신 믹스커피로 작게 즐겨봐요 꺼비";
    }

    // =========================================================
    // 4) 공통 유틸 (요청대로 아래로 분리)
    // =========================================================

    private static final Pattern EMOJI = Pattern.compile("[\\p{So}\\x{1F300}-\\x{1FAFF}]");

    private String polishOneLiner(String text, boolean exceeded, int maxLen) {
        if (text == null) return "";
        String out = text.trim()
                .replaceAll("[\"“”‘’•·\\-*\\n\\r]+", " ")
                .replaceAll("\\s+", " ")
                .trim();

        // 이모지 0~1개 유지
        var m = EMOJI.matcher(out);
        int cnt = 0;
        StringBuffer sb = new StringBuffer();
        while (m.find()) {
            cnt++;
            m.appendReplacement(sb, cnt <= 1 ? m.group() : "");
        }
        m.appendTail(sb);
        out = sb.toString().trim();

        // 길이 제한
        if (maxLen > 0 && out.length() > maxLen) out = out.substring(0, maxLen).trim();

        // 문장부호/공백 정리
        out = out.replaceAll("[。．]+$", "").replaceAll("\\s+[.!?]$", "").trim();

        return out;
    }

    private boolean isExceeded(PushType type) {
        return type == PushType.BUDGET_EXCEEDED_TOTAL || type == PushType.BUDGET_EXCEEDED_CATEGORY
                || (type.code() != null && type.code().startsWith("EXCEEDED/"));
    }

    /** LLM 속담 정리(기호/숫자 제거, 최대 12자 컷) */
    private String sanitizeProverb(String s) {
        if (s == null) return "";
        String out = s.trim()
                .replaceAll("[\"“”‘’•·\\-*\\n\\r]+", " ")
                .replaceAll("\\s+", " ")
                .replaceAll("[.!?]+$", "")
                .replaceAll("꺼비$", "")
                .replaceAll("\\d[\\d,]*(?:\\.\\d+)?\\s*[%원]?", "")
                .trim();
        if (out.length() > 12) out = out.substring(0, 12).trim();
        return out;
    }

    /** 폴백 속담(랜덤 1개) */
    private static final java.util.List<String> PROVERB_FALLBACK = java.util.List.of(
            "아끼면 천 냥 빚도 갚는다",
            "검소함이 최고의 수입",
            "새는 돈이 큰돈을 막는다",
            "한 푼이 큰돈을 이룬다",
            "근검절약은 집안의 근본",
            "허리띠를 졸라매자",
            "절약은 미덕이다",
            "작은 절약 큰 부"
    );

    private String pickFallbackProverb() {
        int i = java.util.concurrent.ThreadLocalRandom.current().nextInt(PROVERB_FALLBACK.size());
        return PROVERB_FALLBACK.get(i);
    }
}
