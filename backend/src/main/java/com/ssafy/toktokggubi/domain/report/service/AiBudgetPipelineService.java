package com.ssafy.toktokggubi.domain.report.service;

import com.ssafy.toktokggubi.domain.budget.dto.BudgetAllSaveRequestDto;
import com.ssafy.toktokggubi.domain.budget.dto.BudgetSaveResponseDto;
import com.ssafy.toktokggubi.domain.budget.repository.UserMonthlyBudgetRepository;
import com.ssafy.toktokggubi.domain.budget.service.BudgetRecommendService;
import com.ssafy.toktokggubi.domain.gms.service.AiBudgetService;
import com.ssafy.toktokggubi.domain.report.dto.request.AiReportInformationRequest;
import com.ssafy.toktokggubi.domain.report.dto.response.AiReportInformationResponse;
import com.ssafy.toktokggubi.global.time.YmResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class AiBudgetPipelineService {

    private final AiReportInformationService reportInformationService; // 기존 service.getInformation(...)
    private final AiBudgetService aiBudgetService;                   // 네가 올린 LLM 보정 → BudgetAllSaveRequestDto
    private final BudgetRecommendService budgetRecommendService;     // DB 저장 서비스
    private final UserMonthlyBudgetRepository umbRepo;               // 존재 여부 확인
    private final YmResolver ymResolver;


    public BudgetSaveResponseDto recommendFromInfoAndSave(AiReportInformationRequest req) {
        // 1) 조회 (기존 서비스)
        AiReportInformationResponse info = reportInformationService.getInformation(req);

        // 2) userId & ym 결정
        Long userId = req.userId();
        String ym = ymResolver.nowYm();

        // 3) 이미 해당 (userId, ym) UMB가 있으면 스킵 (수정 안 함)
        var existing = umbRepo.findByUser_UserIdAndBudgetYm(userId, ym);
        if (existing.isPresent()) {
            return new BudgetSaveResponseDto(
                    ym,
                    existing.get().getUserMonthlyBudgetId(),
                    0, // fixedExpenseCount
                    0  // budgetCategoryCount
            );
        }

        // 4) LLM 보정 → BudgetAllSaveRequestDto 생성
        BudgetAllSaveRequestDto dto = aiBudgetService.refineToBudgetDto(userId, info);

        // 5) DB 저장 (없을 때만 생성; replace-all 로직 활용)
        return budgetRecommendService.saveOrUpdateMonthlyBudget(userId, ym, dto);
    }
}
