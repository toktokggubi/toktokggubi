package com.ssafy.toktokggubi.domain.report.service;

import com.ssafy.toktokggubi.domain.report.dto.request.AiUserReportRequest;
import com.ssafy.toktokggubi.domain.report.dto.request.UserInfo;
import com.ssafy.toktokggubi.domain.report.dto.response.UserReportResponse;
import com.ssafy.toktokggubi.domain.report.entity.AiUserReport;
import com.ssafy.toktokggubi.domain.report.repository.AiUserReportRepository;
import com.ssafy.toktokggubi.global.exception.DataNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * AI 월간 사용자 리포트 관련 비즈니스 로직을 처리하는 서비스.
 */
@Service
@RequiredArgsConstructor
public class AiUserReportService {

    private final AiUserReportRepository aiUserReportRepository;

    public UserInfo getUserInfo(Integer userId, String nickname, Integer year, Integer month) {
        return aiUserReportRepository.findByUserInfo_UserIdAndUserInfo_UsernameAndUserInfo_YearAndUserInfo_Month(userId, nickname, year, month)
                .map(AiUserReport::getUserInfo)
                .orElseThrow(() -> new DataNotFoundException("[aiUserReportService] 사용자의 정보를 찾을 수 없습니다."));
    }

    public UserReportResponse getAiUserReport(UserInfo userInfo) {
        AiUserReport report = aiUserReportRepository.findByUserInfo_UserIdAndUserInfo_UsernameAndUserInfo_YearAndUserInfo_Month(userInfo.getUserId(), userInfo.getUsername(), userInfo.getYear(), userInfo.getMonth())
                .orElseThrow(() -> new DataNotFoundException("[aiUserReportService] 사용자의 해당 월의 리포트를 찾을 수 없습니다."));

        return UserReportResponse.builder()
                .userInfo(report.getUserInfo())
                .summaryReport(report.getSummaryReport())
                .spendingDetails(report.getSpendingDetails())
                .build();
    }

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
                .userInfo(request.getUserInfo())
                .summaryReport(request.getSummaryReport())
                .spendingDetails(request.getSpendingDetails())
                .build();
        aiUserReportRepository.save(aiUserReport);
    }
}