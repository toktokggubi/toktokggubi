package com.ssafy.toktokggubi.domain.report.dto.request;

/**
 * AI 월간 리포트 정보 조회를 위한 요청 DTO.
 *
 * @param userId   사용자 ID
 * @param username 사용자 닉네임 (User.nickname 에 매칭)
 * @param year     조회할 년도 (예: "2025")
 * @param month    조회할 월 (예: "06", "12", 무조건 두자리)
 */
public record AiReportInformationRequest(
        Long userId,
        String username, // User.nickname 에 매칭
        String year,     // "2025"
        String month     // "06" 또는 "12" 같이 두글자
) {}
