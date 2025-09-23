package com.ssafy.toktokggubi.domain.report.dto.response;

import java.util.Map;

public record AiReportInformationResponse(
        Map<String, Long> budget_set, // total + 카테고리별(미설정 -1)
        Map<String, Long> actual      // total + 카테고리별(없으면 0)
) {}
