package com.ssafy.toktokggubi.domain.report.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * AI 월간 사용자 리포트 저장을 위한 요청 DTO.
 * AI 서버로부터 전송되는 전체 리포트 데이터를 담습니다.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiUserReportRequest {
    /**
     * 사용자 정보.
     * JSON 필드명 `userInfo`에 매핑됩니다.
     */
    private UserInfo userInfo;
    /**
     * 요약 보고서.
     * JSON 필드명 `summaryReport`에 매핑됩니다.
     */
    private SummaryReport summaryReport;
    /**
     * 지출 상세 정보.
     * JSON 필드명 `spendingDetails`에 매핑됩니다.
     */
    private SpendingDetails spendingDetails;
}
