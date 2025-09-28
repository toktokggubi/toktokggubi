package com.ssafy.toktokggubi.domain.gms.service;

import com.ssafy.toktokggubi.domain.budget.dto.BudgetAllSaveRequestDto;
import com.ssafy.toktokggubi.domain.budget.dto.CategoryAllocDto;
import com.ssafy.toktokggubi.domain.budget.dto.FixedExpenseDto;
import com.ssafy.toktokggubi.domain.budget.service.BudgetReadService;
import com.ssafy.toktokggubi.domain.gms.llm.LlmClient;
import com.ssafy.toktokggubi.domain.report.dto.response.AiReportInformationResponse;
import com.ssafy.toktokggubi.global.time.YmResolver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiBudgetService {

    private final LlmClient llm;
    private final BudgetReadService budgetReadService; // ← 기존 서비스 재사용
    private final YmResolver ymResolver;               // ← 현재 YM 계산

    public BudgetAllSaveRequestDto refineToBudgetDto(Long userId,
                                                     AiReportInformationResponse info) {

        // 1) LLM 프롬프트로 권장 budget_set 산출(JSON만)
        Map<String, Long> budgetSet = suggestBudgetSetWithLlm(info);
        Long totalAmount = budgetSet.getOrDefault("total", 0L);

        // 2) 고정지출: 기존 서비스에서 현재 달 기준으로 조회 (실패 시 빈 리스트)
        java.util.List<FixedExpenseDto> fixedExpenses;
        try {
            String ym = ymResolver.nowYm();
            fixedExpenses = budgetReadService.getFixedList(userId, ym);
        } catch (Exception e) {
            log.warn("[AI-BUDGET] fixed expense fetch failed, fallback to empty list", e);
            fixedExpenses = java.util.List.of();
        }

        // 3) 카테고리명 → ID 매핑 후 DTO 만들기 (하드맵 사용)
        Map<String, Long> nameToId = loadCategoryNameToIdMap();

        java.util.List<CategoryAllocDto> allocs = new java.util.ArrayList<>();
        java.util.List<Long> selectedIds = new java.util.ArrayList<>();

        for (var e : budgetSet.entrySet()) {
            String key = e.getKey();
            if ("total".equals(key)) continue;
            Long catId = nameToId.get(key);
            long amt = round10k(e.getValue());
            if (catId != null && amt > 0) {
                allocs.add(new CategoryAllocDto(catId, amt));
                selectedIds.add(catId);
            }
        }

        // 4) 합계 보정(반올림 잔차는 etc에 얹기)
        long sumCats = allocs.stream().mapToLong(CategoryAllocDto::finalAmount).sum();
        long delta = (totalAmount == null ? 0L : totalAmount) - sumCats;
        if (delta != 0 && nameToId.containsKey("etc")) {
            Long etcId = nameToId.get("etc");
            boolean applied = false;
            for (int i = 0; i < allocs.size(); i++) {
                if (allocs.get(i).categoryId().equals(etcId)) {
                    var cur = allocs.get(i);
                    allocs.set(i, new CategoryAllocDto(etcId, Math.max(0, cur.finalAmount() + delta)));
                    applied = true;
                    break;
                }
            }
            if (!applied && delta > 0) {
                allocs.add(new CategoryAllocDto(etcId, delta));
                selectedIds.add(etcId);
            }
        }

        return new BudgetAllSaveRequestDto(totalAmount, fixedExpenses, selectedIds, allocs);
    }

    /* ----------------- LLM ----------------- */

    private Map<String, Long> suggestBudgetSetWithLlm(AiReportInformationResponse base) {
        String prompt = buildPrompt(base);
        Map<String, Long> m = null;
        try {
            // GMS 제약: max_output_tokens는 16 이상이어야 함
            String out = llm.complete(prompt, 128, 0.3);
            m = parseBudgetSet(out);
        } catch (Exception e) {
            log.warn("[AI-BUDGET] LLM 실패, 폴백 사용", e);
        }
        if (m == null || m.isEmpty()) m = fallbackFromActual(base);

        // 식비 우선/음수 방지/만원 단위/합계 보정
        m = postprocess(m);
        return m;
    }

    private String buildPrompt(AiReportInformationResponse base) {
        return """
역할: 개인 예산 플래너. 이전 달 실사용(actual)과 기존 예산(budget_set)을 참고해 이번 달 권장 예산(budget_set)을 산출하라.

출력 스키마(반드시 준수):
- JSON만 출력한다.
- 최상위 키는 "budget_set" 하나다.
- "budget_set"은 아래 **숫자 키**만 가진다. (문자 키 금지)
  - "total": 전체 합계
  - "1": food
  - "2": cafe
  - "3": nightlife
  - "4": life
  - "5": cosmetic
  - "6": transportation
  - "7": car
  - "8": medical
  - "9": entertainment
  - "10": shopping
제약:
- 모든 값은 0 이상의 정수(원 단위). 콤마/기호 금지.
- 누락된 카테고리는 0으로 채운다.
- total 은 각 카테고리(1..10)의 합과 **정확히 같아야 한다**. (오차 허용 없음)
- food(1) ≥ cafe(2), entertainment(9)를 보장한다.

참고 데이터(모델이 고려만 하되 그대로 복사 금지):
[이전 예산]
%s

[이전 달 실사용]
%s

출력 형식 예(구조 예시일 뿐 값은 재계산):
{"budget_set":{"total":1230000,"1":200000,"2":100000,"3":0,"4":0,"5":0,"6":300000,"7":0,"8":0,"9":0,"10":500000,"11":130000}}
""".formatted(flat(base.budget_set()), flat(base.actual()));
    }
    private String flat(Map<String, Long> m) {
        String[] order = keys(); // ["total","food","cafe",...,"etc"]
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < order.length; i++) {
            String k = order[i];
            long v = (m == null) ? 0L : m.getOrDefault(k, 0L);
            if (i > 0) sb.append(", ");
            sb.append(k).append("=").append(v);
        }
        return sb.toString();
    }


    @SuppressWarnings("unchecked")
    private Map<String, Long> parseBudgetSet(String json) {
        try {
            var mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            var root   = mapper.readTree(json);
            var bs     = root.get("budget_set");
            if (bs == null || bs.isNull()) return java.util.Collections.emptyMap();

            Map<String, Long> out = new java.util.LinkedHashMap<>();

            // 1) total
            long total = Math.max(0L, bs.path("total").asLong(0L));
            out.put("total", total);

            // 2) 우선 숫자 키 "1"~"10" 채우기
            for (int i = 1; i <= 10; i++) {
                String k = String.valueOf(i);
                long v = Math.max(0L, bs.path(k).asLong(0L));
                out.put(k, v);
            }

            // 3) 혹시 영문 키로 온 경우 보정(영문 → 숫자ID)
            Map<String, String> nameToId = nameKeyToIdStrMap();
            for (var it = nameToId.entrySet().iterator(); it.hasNext();) {
                var e = it.next();
                String nameKey = e.getKey();     // "food" ...
                String idKey   = e.getValue();   // "1" ...
                if (bs.has(nameKey)) {
                    long v = Math.max(0L, bs.path(nameKey).asLong(0L));
                    out.put(idKey, v);
                }
            }

            return out;
        } catch (Exception e) {
            return java.util.Collections.emptyMap();
        }
    }

    private Map<String, String> nameKeyToIdStrMap() {
        Map<String, String> m = new java.util.HashMap<>();
        m.put("food", "1");
        m.put("cafe", "2");
        m.put("nightlife", "3");
        m.put("life", "4");
        m.put("shopping", "5");
        m.put("cosmetic", "6");
        m.put("transportation", "7");
        m.put("car", "8");
        m.put("medical", "9");
        m.put("entertainment", "10");
        // etc는 DB 카테고리 없음(무시)
        return m;
    }
    /* ======================= 헬퍼/유틸 추가 ======================= */

    /** 카테고리 키(영문 or 숫자 문자열) -> DB categoryId 매핑 */
    private Map<String, Long> loadCategoryNameToIdMap() {
        Map<String, Long> m = new java.util.HashMap<>();
        // 영문 키
        m.put("food", 1L);
        m.put("cafe", 2L);
        m.put("nightlife", 3L);
        m.put("life", 4L);
        m.put("shopping", 5L);
        m.put("cosmetic", 6L);
        m.put("transportation", 7L);
        m.put("car", 8L);
        m.put("medical", 9L);
        m.put("entertainment", 10L);
        // 숫자 키("1"~"10")도 바로 매핑
        for (int i = 1; i <= 10; i++) {
            m.put(String.valueOf(i), (long) i);
        }
        return m;
    }

    /** 만원 단위 반올림 */
    private long round10k(long v) {
        if (v <= 0) return 0L;
        return Math.round(v / 10_000.0) * 10_000L;
    }

    /** LLM 실패 시 폴백 생성: 이전 값/실사용 비율로 권장치 구성(키는 영문 기반으로 반환) */
    private Map<String, Long> fallbackFromActual(AiReportInformationResponse base) {
        Map<String, Long> prevBudget = base.budget_set(); // 영문 키 맵
        Map<String, Long> prevActual = base.actual();     // 영문 키 맵

        long baseTotal = get(prevBudget, "total");
        if (baseTotal <= 0) baseTotal = get(prevActual, "total");
        if (baseTotal <= 0) baseTotal = 1_000_000L;

        long target = round10k(Math.round(baseTotal * 0.95)); // 이전 총액의 95% 추천

        long sumCats = sumCatsByName(prevActual); // 영문 카테고리 합

        Map<String, Long> out = new java.util.LinkedHashMap<>();
        out.put("total", target);

        String[] names = new String[]{"food","cafe","nightlife","life","shopping","cosmetic","transportation","car","medical","entertainment"};
        if (sumCats <= 0) {
            long each = round10k(Math.round(target / (double) names.length));
            for (String k : names) out.put(k, each);
        } else {
            for (String k : names) {
                long v = Math.round(target * (get(prevActual, k) / (double) sumCats));
                out.put(k, v);
            }
        }

        // 식비 우선
        enforceFoodPriority(out);
        // 만원 단위
        out.replaceAll((k, v) -> round10k(v));
        // 합계 델타는 식비로 보정(영문 키 기반)
        adjustDeltaToFood(out, target);

        return out;
    }

    /** 후처리: 음수 방지 → 만원 반올림 → 식비 우선 → 델타 식비 보정 (영문/숫자 키 모두 대응) */
    private Map<String, Long> postprocess(Map<String, Long> m) {
        if (m == null) m = new java.util.LinkedHashMap<>();
        // 음수 방지
        m.replaceAll((k, v) -> Math.max(0L, v == null ? 0L : v));
        // 만원 반올림(총액 total도 포함)
        m.replaceAll((k, v) -> round10k(v));
        // 식비 우선(영문/숫자 키 모두 허용)
        enforceFoodPriority(m);
        // 델타 보정: 식비("1" 또는 "food")에 얹기
        long total = m.getOrDefault("total", 0L);
        adjustDeltaToFood(m, total);
        return m;
    }

    /** 프롬프트 표시 순서(영문 키) */
    private String[] keys() {
        return new String[]{
                "total","food","cafe","nightlife","life","cosmetic",
                "transportation","car","medical","entertainment","shopping","etc"
        };
    }

    /** 식비 우선 규칙: food(식비) ≥ cafe, entertainment */
    private void enforceFoodPriority(Map<String, Long> m) {
        long food = firstNonZero(m, "1", "food");
        long cafe = firstNonZero(m, "2", "cafe");
        long ent  = firstNonZero(m, "10", "entertainment");

        long newFood = Math.max(food, Math.max(cafe, ent));
        if (m.containsKey("1")) {
            m.put("1", newFood);
        } else {
            m.put("food", newFood);
        }
    }

    /** 합계-총액 델타를 식비에 반영(숫자 키 "1" 우선, 없으면 "food") */
    private void adjustDeltaToFood(Map<String, Long> m, long targetTotal) {
        long sum = 0L;

        // 숫자키 "1"~"10" 합산
        boolean hasNumeric = false;
        for (int i = 1; i <= 10; i++) {
            String k = String.valueOf(i);
            if (m.containsKey(k)) { hasNumeric = true; }
            sum += m.getOrDefault(k, 0L);
        }

        if (!hasNumeric) {
            // 영문 키 합산
            sum = sumCatsByName(m);
        }

        long delta = targetTotal - sum;
        if (delta == 0) return;

        if (m.containsKey("1")) {
            m.put("1", Math.max(0L, m.get("1") + delta));
        } else {
            m.put("food", Math.max(0L, m.getOrDefault("food", 0L) + delta));
        }
    }

    /** 맵에서 첫 번째 존재하는 키 값을 반환(없으면 0) */
    private long firstNonZero(Map<String, Long> m, String primary, String fallback) {
        if (m.containsKey(primary)) return m.getOrDefault(primary, 0L);
        return m.getOrDefault(fallback, 0L);
    }

    /** 영문 키 합(카테고리 10개만) */
    private long sumCatsByName(Map<String, Long> m) {
        String[] names = new String[]{"food","cafe","nightlife","life","shopping","cosmetic","transportation","car","medical","entertainment"};
        long s = 0L;
        for (String k : names) s += (m == null) ? 0L : m.getOrDefault(k, 0L);
        return s;
    }

    /** 안전 get */
    private long get(Map<String, Long> m, String key) {
        return (m == null) ? 0L : m.getOrDefault(key, 0L);
    }

}
