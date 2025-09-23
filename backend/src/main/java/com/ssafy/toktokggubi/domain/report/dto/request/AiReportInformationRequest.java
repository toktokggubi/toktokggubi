package com.ssafy.toktokggubi.domain.report.dto.request;

public record AiReportInformationRequest(
        Long userId,
        String username, // User.nickname 에 매칭
        String year,     // "2025"
        String month     // "6" 또는 "06"
) {}
