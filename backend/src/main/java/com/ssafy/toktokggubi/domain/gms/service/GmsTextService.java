package com.ssafy.toktokggubi.domain.gms.service;

import com.ssafy.toktokggubi.domain.push.dto.PushType;
import com.ssafy.toktokggubi.domain.gms.llm.LlmClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
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
    public Map<String, Long> suggestCategoryAllocations(List<String> categoryNames, long pool) {
        if (pool <= 0 || categoryNames == null || categoryNames.isEmpty()) {
            return categoryNames.stream().collect(
                    java.util.stream.Collectors.toMap(n -> n, n -> 0L, (a,b)->a, java.util.LinkedHashMap::new));
        }

        // 0) 풀 자체를 10,000원 단위로 반올림
        final long UNIT = 10_000L;
       long poolFloor = (pool / UNIT) * UNIT;     // 예: 2,160,000
        long tail      = pool - poolFloor;         // 예: 5,600 (0..9,999)

        // 1) LLM에게 퍼센트 받기 (아래 B 프롬프트 개선도 함께 반영)
        Map<String, Integer> pctByName = null;
        try {
            String prompt = buildBetterAllocPrompt(categoryNames, poolFloor);
            String out = llm.complete(prompt, 200, 0.4);
            pctByName = parsePercentJson(out);
        } catch (Exception ignore) {}

        // 2) 파싱 실패/부적절 시 폴백(균등 or 규칙 기반)
        if (pctByName == null || pctByName.isEmpty()) {
            pctByName = fallbackPercent(categoryNames); // 아래 C 참고
        }

        // 2.5) LLM 결과를 FLOOR/CAP 범위로 클램프하고 합계=100으로 재정규화
       pctByName = clampAndNormalizeTo100(pctByName, categoryNames, FLOOR, CAP);


        // 3) 금액 환산 + 만원 단위 반올림
        Map<String, Long> amt = new java.util.LinkedHashMap<>();
        long sum = 0L;
        String primary = null; // 비중 가장 큰 카테고리
        int primaryPct = -1;

        for (String name : categoryNames) {
            int pct = Math.max(0, pctByName.getOrDefault(name, 0));
            long v = Math.round(poolFloor * (pct / 100.0));
            v = Math.round(v / 10_000.0) * 10_000L; // ★ 만원 단위 반올림
            amt.put(name, v);
            sum += v;
            if (pct > primaryPct) { primaryPct = pct; primary = name; }
        }

        // 4) 잔차 보정(만원 단위 유지)
        long delta = poolFloor - sum;
        if (delta != 0 && primary != null) {
            long adj = Math.round(delta / 10_000.0) * 10_000L; // 만원 단위로만 조정
            amt.put(primary, Math.max(0L, amt.get(primary) + adj));
            sum += adj;
        }

        if (tail != 0 && primary != null) {
            amt.put(primary, Math.max(0L, amt.getOrDefault(primary, 0L) + tail));}


        // 마지막 안전: 합계가 여전히 안 맞으면(이론상 드묾) 가장 앞 항목에 맞춰 클램프
        if (sum != poolFloor && !amt.isEmpty()) {
            String first = categoryNames.get(0);
            long need = poolFloor - sum;
            long adj = Math.round(need / 10_000.0) * 10_000L;
            amt.put(first, Math.max(0L, amt.get(first) + adj));
        }

        return amt;
    }
    private static final Map<String,Integer> RELAX_TOP = Map.of(
            "식비", 80,
            "카페/간식", 25,
            "문화", 20,
            "생활", 60,
            "교통", 40,
            "의료/건강", 40,
            "쇼핑", 20,
            "뷰티/미용", 15,
            "술/유흥", 15,
            "자동차", 30
    );
    private static final Map<String, Integer> FLOOR = Map.ofEntries(
            Map.entry("식비",20), Map.entry("카페/간식",3), Map.entry("술/유흥",1),
            Map.entry("생활",8),  Map.entry("쇼핑",2),     Map.entry("뷰티/미용",2),
            Map.entry("교통",3),  Map.entry("자동차",5),   Map.entry("의료/건강",2),
            Map.entry("문화",2)
    );
    private static final Map<String, Integer> CAP = Map.ofEntries(
            Map.entry("식비",45), Map.entry("카페/간식",15), Map.entry("술/유흥",10),
            Map.entry("생활",30), Map.entry("쇼핑",10),     Map.entry("뷰티/미용",10),
            Map.entry("교통",15), Map.entry("자동차",20),   Map.entry("의료/건강",12),
            Map.entry("문화",10)
    );

    private static String toJsonArray(List<String> names) {
        return names.stream()
                .map(n -> "\"" + n + "\"")
                .collect(java.util.stream.Collectors.joining(", ", "[", "]"));
    }

    private String buildBetterAllocPrompt(List<String> names, long pool) {
        // 입력 목록에 있는 카테고리에 대해서만 규칙 생성
        String catsJson = toJsonArray(names);

        // 카테고리별 절대 제약(하한/상한)
        StringBuilder perCat = new StringBuilder();
        for (String n : names) {
            Integer f = FLOOR.get(n);
            Integer c = CAP.get(n);
            if (f != null || c != null) {
                perCat.append(String.format("- \"%s\": percent %s%s%s%n",
                        n,
                        f != null ? String.format("≥ %d", f) : "",
                        (f != null && c != null) ? " and " : "",
                        c != null ? String.format("≤ %d", c) : ""
                ));
            }
        }

        // 상대 제약(존재할 때만 적용)
        boolean hasFood  = names.contains("식비");
        boolean hasCafe  = names.contains("카페/간식");
        boolean hasCult  = names.contains("문화");
        boolean hasLife  = names.contains("생활");
        boolean hasShop  = names.contains("쇼핑");
        boolean hasMed   = names.contains("의료/건강");
        boolean hasLiqu  = names.contains("술/유흥");

        StringBuilder pairwise = new StringBuilder();
        if (hasFood && hasCafe) pairwise.append("- \"식비\" > \"카페/간식\"\n");
        if (hasCafe && hasCult) pairwise.append("- \"카페/간식\" > \"문화\"\n");
        if (hasLife && hasShop) pairwise.append("- \"생활\" ≥ \"쇼핑\"\n");
        if (hasMed  && hasLiqu) pairwise.append("- \"의료/건강\" ≥ \"술/유흥\"\n");

        return """
역할: 예산 분배 플래너.

입력:
- 총 분배 금액(원): %,d
- 카테고리(아래 목록만 사용; 각 항목을 정확히 1번씩 사용; 입력 순서를 유지해 반환): %s

출력(JSON만, 한 줄):
{"allocations":[{"name":"카테고리명","percent":정수}, ...]}

필수 형식/규칙:
1) allocations 배열 길이 = 입력 카테고리 개수와 동일.
2) 모든 name은 입력 목록의 항목과 "완전히 동일"해야 함(띄어쓰기/슬래시/대소문자 포함).
3) percent는 0 이상 정수, 합계는 "정확히 100".
4) 마지막 항목에서 보정해서라도 합계=100을 보장.

카테고리별 절대 제약(존재하는 항목에만 적용):
%s
상대 제약(존재하는 항목에만 적용):
%s
지침:
- 필수/생계성 지출은 높이고, 사치성 지출은 낮춘다.
- 필수/생계성 지출 : 식비, 생활 , 교통, 의료/건강 
- 사치성 지출 : 카페/간식 , 술/유흥, 쇼핑, 뷰티/미용, 자동차, 문화
- 위 제약을 모두 만족하도록 내부 계산 후, 출력은 오직 지정된 JSON 형식만 내보낸다.
설명/문장/코드블록/주석/추가 텍스트 금지.
""".formatted(pool, catsJson, perCat.toString(), pairwise.toString());
    }
    private Map<String, Integer> fallbackPercent(List<String> names) {
        // 기본은 균등
        int n = names.size();
        int base = 100 / n, rem = 100 - base * n;
        Map<String, Integer> map = new java.util.LinkedHashMap<>();
        for (int i = 0; i < n; i++) map.put(names.get(i), base + (i < rem ? 1 : 0));

        // 우선순위 보정(있는 경우만)
        String eat   = names.stream().filter(s -> s.contains("식비")).findFirst().orElse(null);
        String cafe  = names.stream().filter(s -> s.contains("카페")).findFirst()
                .orElseGet(() -> names.stream().filter(s -> s.contains("간식")).findFirst().orElse(null));
        String cult  = names.stream().filter(s -> s.contains("문화")).findFirst().orElse(null);

        if (eat != null)   map.put(eat, 50);
        if (cafe != null)  map.put(cafe, 30);
        if (cult != null)  map.put(cult, 20);

        // 합계 보정
        int sum = map.values().stream().mapToInt(Integer::intValue).sum();
        if (sum != 100) {
            String last = names.get(names.size()-1);
            map.put(last, Math.max(0, map.get(last) + (100 - sum)));
        }
        return map;
    }
    @SuppressWarnings("unchecked")
    private Map<String, Integer> parsePercentJson(String json) {
        // 가벼운 파서(진짜 구현에서는 ObjectMapper 사용 권장)
        try {
            var mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            var root = mapper.readTree(json);
            var arr  = root.get("allocations");
            Map<String, Integer> map = new java.util.LinkedHashMap<>();
            for (var node : arr) {
                String name = node.get("name").asText();
                int pct     = node.get("percent").asInt();
                map.put(name, pct);
            }
            // 합계 보정(100)
            int sum = map.values().stream().mapToInt(Integer::intValue).sum();
            if (sum != 100 && !map.isEmpty()) {
                String lastKey = null;
                for (String k : map.keySet()) lastKey = k;
                map.put(lastKey, Math.max(0, map.get(lastKey) + (100 - sum)));
            }
            return map;
        } catch (Exception e) {
            return java.util.Collections.emptyMap();
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
    private static Map<String,Integer> clampAndNormalizeTo100(
            Map<String,Integer> in,
            List<String> names,
            Map<String,Integer> floor,
            Map<String,Integer> cap
    ) {
        int n = names.size();
        int[] f = new int[n], c = new int[n], v = new int[n];

        int sumFloor = 0, sumCap = 0;
        for (int i=0;i<n;i++) {
            String k = names.get(i);
            f[i] = Math.max(0, floor.getOrDefault(k, 0));
            c[i] = Math.min(100, Math.max(f[i], cap.getOrDefault(k, 100)));
            sumFloor += f[i];
            sumCap   += c[i];
        }
        // FLOOR 합이 100 초과하면 비율 축소
        if (sumFloor > 100) {
            f = scaleVectorToSum(f, 100);
            for (int i=0;i<n;i++) c[i] = Math.max(c[i], f[i]); // 일관성
        }
        // 선택한 카테고리만으로 CAP 합이 100 미만이면 → 캡 완화(부분집합 상황)
         if (sumCap < 100) {
             int newSumCap = 0;
             for (int i = 0; i < n; i++) {
                 final String name = names.get(i);                // <-- 여기 추가
                 final int baseCap = c[i];
                 final int relaxTop = RELAX_TOP.getOrDefault(name, baseCap);
                 // f[i] ≤ c[i] ≤ relaxTop
                 c[i] = Math.min(relaxTop, Math.max(c[i], f[i]));
                 newSumCap += c[i];
                     }
                 // 극단 케이스: 그래도 합이 100 미만이면, '가장 우선' 항목(식비 등)에만 추가 완화
                         if (newSumCap < 100) {
                         for (int i=0;i<n && newSumCap<100;i++) {
                                 String name = names.get(i);
                                 if ("식비".equals(name)) {
                                        int extra = Math.min(100 - newSumCap, 100 - c[i]);
                                         c[i] += extra; newSumCap += extra;
                                     }
                             }
                     }
         }

        int sum = 0;
        for (int i=0;i<n;i++) {
            String k = names.get(i);
            int x = (in==null) ? 0 : Math.max(0, in.getOrDefault(k, 0));
            v[i] = Math.max(f[i], Math.min(c[i], x));
            sum += v[i];
        }

        if (sum < 100) distributeUp(v, c, 100 - sum);      // headroom 큰 순
        else if (sum > 100) distributeDown(v, f, sum - 100); // 여유 큰 순

        LinkedHashMap<String,Integer> out = new LinkedHashMap<>();
        for (int i=0;i<n;i++) out.put(names.get(i), v[i]);
        return out;
    }

    private static int[] scaleVectorToSum(int[] arr, int target) {
        int n = arr.length;
        double[] exact = new double[n];
        int[] floor = new int[n]; int base = 0, sum=0;
        for (int x: arr) sum += x;
        double s = (sum==0) ? 0.0 : (target*1.0/sum);
        for (int i=0;i<n;i++) { exact[i]=arr[i]*s; floor[i]=(int)Math.floor(exact[i]); base+=floor[i]; }
        int leftover = target - base;
        List<Integer> idx = new ArrayList<>();
        for (int i=0;i<n;i++) idx.add(i);
        idx.sort((a,b)-> Double.compare(exact[b]-floor[b], exact[a]-floor[a]));
        int[] out = Arrays.copyOf(floor, floor.length);
        for (int i=0;i<leftover && i<idx.size();i++) out[idx.get(i)]++;
        return out;
    }

    private static void distributeUp(int[] v, int[] cap, int need) {
        int n = v.length;
        while (need > 0) {
            int best = -1; double room = -1;
            for (int i=0;i<n;i++) {
                int r = cap[i] - v[i];
                if (r > room) { room = r; best = i; }
            }
            if (best < 0 || room <= 0) break;
            v[best]++; need--;
        }
    }
    private static void distributeDown(int[] v, int[] floor, int need) {
        int n = v.length;
        while (need > 0) {
            int best = -1; double room = -1;
            for (int i=0;i<n;i++) {
                int r = v[i] - floor[i];
                if (r > room) { room = r; best = i; }
            }
            if (best < 0 || room <= 0) break;
            v[best]--; need--;
        }
    }



    private String pickFallbackProverb() {
        int i = java.util.concurrent.ThreadLocalRandom.current().nextInt(PROVERB_FALLBACK.size());
        return PROVERB_FALLBACK.get(i);
    }
}
