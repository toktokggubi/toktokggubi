package com.ssafy.toktokggubi.domain.report.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiUserReportGetRequest {
    private Integer userId;
    private String username;
    private Integer year;
    private Integer month;
}
