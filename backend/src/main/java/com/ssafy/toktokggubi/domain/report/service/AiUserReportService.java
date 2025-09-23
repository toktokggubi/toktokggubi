package com.ssafy.toktokggubi.domain.report.service;

import com.ssafy.toktokggubi.domain.report.dto.request.AiUserReportRequest;
import com.ssafy.toktokggubi.domain.report.entity.AiUserReport;
import com.ssafy.toktokggubi.domain.report.repository.AiUserReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AiUserReportService {

    private final AiUserReportRepository aiUserReportRepository;

    public void saveAiUserReport(AiUserReportRequest request) {
        AiUserReport aiUserReport = AiUserReport.builder()
                .userId(request.userId())
                .username(request.username())
                .overall_summary(request.overall_summary())
                .anomalies(request.anomalies())
                .adjustment(request.adjustment())
                .year(request.year())
                .month(request.month())
                .build();
        aiUserReportRepository.save(aiUserReport);
    }
}
