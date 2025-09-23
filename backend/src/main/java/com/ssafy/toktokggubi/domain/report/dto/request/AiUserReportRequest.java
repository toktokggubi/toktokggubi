package com.ssafy.toktokggubi.domain.report.dto.request;

import java.util.List;

/**
 * AI 사용자 리포트 저장을 위한 요청 DTO.
 *
 * @param userId                사용자 ID
 * @param username              사용자 닉네임
 * @param overall_summary       전체 요약
 * @param anomalies             AI 판단 과소비 결제 목록
 * @param adjustment            조정 내용
 * @param year                  리포트 년도
 * @param month                 리포트 월
 */
public record AiUserReportRequest(
        Long userId,
        String username,
        String overall_summary,
        List<String> anomalies,
        String adjustment,
        int year,
        int month
) {}
