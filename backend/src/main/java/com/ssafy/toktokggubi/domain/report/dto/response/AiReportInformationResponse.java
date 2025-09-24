package com.ssafy.toktokggubi.domain.report.dto.response;

import java.util.Map;

/**
 * AI 월간 리포트 정보 조회를 위한 응답 DTO.
 *
 * @param budget_set 예산 설정 정보 (total + 카테고리별, 미설정 시 -1)
 * @param actual     실제 지출 정보 (total + 카테고리별, 없으면 0)
 */
public record AiReportInformationResponse(
        Map<String, Long> budget_set, // total + 카테고리별(미설정 -1)
        Map<String, Long> actual      // total + 카테고리별(없으면 0)
) {}
