package com.ssafy.toktokggubi.domain.report.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
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
     * JSON 필드명 `user_info`에 매핑됩니다.
     */
    @JsonProperty("user_info")
    private UserInfo user_info;
    /**
     * 요약 보고서.
     * JSON 필드명 `summary_report`에 매핑됩니다.
     */
    @JsonProperty("summary_report")
    private SummaryReport summary_report;
    /**
     * 지출 상세 정보.
     * JSON 필드명 `spending_details`에 매핑됩니다.
     */
    @JsonProperty("spending_details")
    private SpendingDetails spending_details;
}
