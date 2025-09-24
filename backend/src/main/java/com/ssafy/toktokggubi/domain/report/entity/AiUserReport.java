package com.ssafy.toktokggubi.domain.report.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.ssafy.toktokggubi.domain.report.dto.request.SpendingDetails;
import com.ssafy.toktokggubi.domain.report.dto.request.SummaryReport;
import com.ssafy.toktokggubi.domain.report.dto.request.UserInfo;
import lombok.Builder;
import lombok.Getter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * AI 월간 사용자 리포트 데이터를 MongoDB에 저장하기 위한 엔티티.
 * AI 서버로부터 받은 전체 리포트 구조를 반영합니다.
 */
@Getter
@Builder
@Document(collection = "ai_user_report")
public class AiUserReport {
    @Id
    private String id;
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
