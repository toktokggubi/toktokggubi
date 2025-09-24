package com.ssafy.toktokggubi.domain.report.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 사용자 정보를 담는 DTO.
 * AI 월간 리포트의 사용자 정보 섹션에 사용됩니다.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserInfo {
    private Long userId;
    private String username;
    private Integer year;
    private Integer month;
}