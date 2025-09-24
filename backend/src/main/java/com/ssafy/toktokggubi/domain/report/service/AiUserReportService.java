package com.ssafy.toktokggubi.domain.report.service;

import com.ssafy.toktokggubi.domain.report.dto.request.AiUserReportRequest;
import com.ssafy.toktokggubi.domain.report.entity.AiUserReport;
import com.ssafy.toktokggubi.domain.report.repository.AiUserReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * AI 월간 사용자 리포트 관련 비즈니스 로직을 처리하는 서비스.
 */
@Service
@RequiredArgsConstructor
public class AiUserReportService {

    private final AiUserReportRepository aiUserReportRepository;

    /**
     * AI 서버로부터 받은 사용자 월간 리포트를 저장합니다.
     * AiUserReportRequest DTO의 데이터를 AiUserReport 엔티티로 매핑하여 MongoDB에 저장합니다.
     *
     * @param request AI 서버로부터 받은 전체 리포트 데이터를 담는 요청 DTO
     */
    public void saveAiUserReport(AiUserReportRequest request) {
        // AiUserReportRequest의 구조가 AiUserReport 엔티티의 구조와 일치하므로,
        // 직접 필드를 매핑하여 엔티티를 생성합니다.
        AiUserReport aiUserReport = AiUserReport.builder()
                .user_info(request.getUser_info())
                .summary_report(request.getSummary_report())
                .spending_details(request.getSpending_details())
                .build();
        aiUserReportRepository.save(aiUserReport);
    }
}