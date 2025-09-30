package com.ssafy.toktokggubi.domain.report.entity;

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
@Document(collection = "aiUserReport")
public class AiUserReport {
    @Id
    private String id;
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
