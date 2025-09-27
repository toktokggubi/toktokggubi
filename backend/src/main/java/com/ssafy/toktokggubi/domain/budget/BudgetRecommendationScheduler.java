package com.ssafy.toktokggubi.domain.budget;

import com.ssafy.toktokggubi.domain.report.dto.request.AiReportInformationRequest;
import com.ssafy.toktokggubi.domain.report.service.AiBudgetPipelineService;
import com.ssafy.toktokggubi.domain.user.repository.UserRepository;
import com.ssafy.toktokggubi.global.time.YmResolver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class BudgetRecommendationScheduler {

    private final AiBudgetPipelineService pipeline;
    private final UserRepository userRepository; // findActiveUserIds(), findNicknameById()
    private final YmResolver ymResolver;

    // 매월 1일 12:00 KST
    @Scheduled(cron = "0 0 12 1 * *", zone = "Asia/Seoul")
    public void runMonthly() {
        runOnce(null); // 전월/전체 사용자로 실행
    }


    public ManualRunSummary  runOnce(String ymOverride) {
        // 1) 활성 사용자 목록
        final String ym = (ymOverride != null && !ymOverride.isBlank()) ? ymOverride : ymResolver.prevYm();
        if (ym == null || ym.length() != 6) throw new IllegalStateException("YM format error: " + ym);

        final String year = ym.substring(0, 4);
        final String month = ym.substring(4, 6);

        final List<Long> userIds = userRepository.findAllUserIds();

        final List<Long> succeeded = new java.util.ArrayList<>();
        final java.util.Map<Long, String> failed = new java.util.LinkedHashMap<>();

        for (Long userId : userIds) {
            try {
                String username = userRepository.findNicknameByUserId(userId); // null 허용
                AiReportInformationRequest req = new AiReportInformationRequest(userId, username, year, month);
                pipeline.recommendFromInfoAndSave(req);
                succeeded.add(userId);
            } catch (Exception e) {
                failed.put(userId, e.getClass().getSimpleName() + ": " + (e.getMessage() == null ? "" : e.getMessage()));
                log.warn("recommend failed for userId={}", userId, e);
            }
        }
        return new ManualRunSummary(
                ym,
                userIds.size(),
                succeeded.size(),
                failed.size(),
                succeeded,
                failed
        );
    }
    /** 수동 실행 결과 요약 DTO */
    public record ManualRunSummary(
            String ym,
            int totalUsers,
            int success,
            int failed,
            List<Long> succeededUserIds,
            Map<Long, String> failedReasons
    ) {}
}
