package com.ssafy.toktokggubi.domain.gms.service;

import com.ssafy.toktokggubi.domain.budget.dto.TotalAmountResponseDto;
import com.ssafy.toktokggubi.domain.gms.llm.LlmClient;

import com.ssafy.toktokggubi.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiSuggestService {

    private final UserRepository userRepository; // monthly_income 조회
    private final LlmClient llm;                 // GMS 경유 LLM 클라이언트

    public TotalAmountResponseDto suggestLivingBudget(Long userId) {
        long income = fetchMonthlyIncome(userId);
        if (income <= 0) {
            // 소득이 없으면 보수적으로 0 반환(또는 기본값)
            return new TotalAmountResponseDto(0L);
        }

        // 1) LLM 프롬프트 (숫자만 출력하게 강제)
        String prompt = """
                역할: 한국 가계 재무 코치.
                입력: 월 소득은 %,d원.
                지시:
                - 한국의 일반적 지출 관례를 참고해 '이번 달 생활비 권장 총액'을 산정하라.
                - 총 카테고리는 식비,카페,술,자동차,생활용품,미용,옷,교통,의료,문화 
                - 출력 형식: 숫자만, 원 단위 정수, 콤마/한글/기호/단위 모두 금지(예: 1200000).
                - 6자리~9자리 범위를 선호(과도한 값 지양).
                """.formatted(income);

        Long llmValue = null;
        try {
            String out = llm.complete(prompt, /*maxTokens*/ 32, /*temperature*/ 0.2);
            llmValue = parseFirstLong(out);
        } catch (Exception e) {
            log.warn("[AI-SET] LLM 호출 실패, 폴백 규칙 사용", e);
        }

        // 2) 값 검증 & 보정(이상치 방지: 20%~60% 범위)
        long min = Math.round(income * 0.20);
        long max = Math.round(income * 0.60);
        long fallback = Math.round(income * 0.35); // 폴백(35% 룰)
        long candidate = (llmValue == null) ? fallback : llmValue;

        if (candidate < min || candidate > max) {
            candidate = fallback;
        }

        // 3) 1만원 단위 반올림
        long rounded = Math.round(candidate / 10_000.0) * 10_000L;

        return new TotalAmountResponseDto(rounded);
    }

    private long fetchMonthlyIncome(Long userId) {
        return userRepository.findMonthlyIncome(userId)
                .filter(v -> v != null && v > 0)
                .orElse(0L);
    }

    private Long parseFirstLong(String s) {
        if (s == null) return null;
        Matcher m = Pattern.compile("(\\d{5,10})").matcher(s); // 5~10자리 숫자만
        return m.find() ? Long.parseLong(m.group(1)) : null;
    }
}
