package com.ssafy.toktokggubi.domain.budget.controller;

import com.ssafy.toktokggubi.domain.budget.dto.DraftPatchRequest;
import com.ssafy.toktokggubi.domain.budget.dto.DraftSaveResponse;
import com.ssafy.toktokggubi.domain.budget.service.BudgetCommitService;
import com.ssafy.toktokggubi.domain.budget.service.BudgetDraftService;

import com.ssafy.toktokggubi.global.security.utils.SecurityUtils;
import com.ssafy.toktokggubi.global.time.YmResolver;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import com.ssafy.toktokggubi.domain.budget.dto.BudgetCommitRequest;
import com.ssafy.toktokggubi.domain.budget.dto.BudgetCommitResponse;


@RestController
@RequestMapping("/budget")
@RequiredArgsConstructor
@Tag(name = "예산관리", description = "예산관리 관련 API")
public class BudgetController {

    private final BudgetDraftService draftService;
    private final BudgetCommitService commitService;
    private final YmResolver ymResolver;

    // BD-1, BD-3, BD-6 (draft 저장)
    // BD-1, BD-3, BD-6 (draft 저장)
    // import 생략: Operation, ApiResponse, ApiResponses 등

    @PostMapping("/draft/save/total")
    @Operation(
            summary = "BD-1 총예산 저장(현재 달)",
            description = "총예산 입력 단계. budgetYm은 서버가 현재 달로 고정합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "저장 성공"),
            @ApiResponse(responseCode = "409", description = "버전 충돌"),
            @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    public DraftSaveResponse saveDraftTotal(

                                            @RequestBody DraftPatchRequest req) {


        Long userId = SecurityUtils.currentUserIdOrNull();
        String ym = ymResolver.nowYm();
        draftService.delete(userId, ym);

        return doSave(userId, req);
    }

    @PostMapping("/draft/save/fixed")
    @Operation(
            summary = "BD-3 고정지출 저장(현재 달)",
            description = "고정지출 입력/수정 단계. budgetYm은 서버가 현재 달로 고정합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "저장 성공"),
            @ApiResponse(responseCode = "409", description = "버전 충돌"),
            @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    public DraftSaveResponse saveDraftFixed(
                                            @RequestBody DraftPatchRequest req) {
        Long userId = SecurityUtils.currentUserIdOrNull();
        return doSave(userId, req);
    }

    @PostMapping("/draft/save/categories")
    @Operation(
            summary = "BD-6 카테고리/금액 저장(현재 달)",
            description = "카테고리 선택 및 금액 배분 단계. budgetYm은 서버가 현재 달로 고정합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "저장 성공"),
            @ApiResponse(responseCode = "409", description = "버전 충돌"),
            @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    public DraftSaveResponse saveDraftCategories(

                                                 @RequestBody DraftPatchRequest req) {
        Long userId = SecurityUtils.currentUserIdOrNull();
        return doSave(userId, req);
    }

    /* 공통 저장 로직 (현재 달 고정) */
    /* 공통 저장 로직 (현재 달 고정) */
    private DraftSaveResponse doSave(Long userId, DraftPatchRequest req) {
        String ym = ymResolver.nowYm();
        var snap = draftService.mergeAndSave(userId, ym, req);
        return new DraftSaveResponse(
                "budget:draft:%d:%s".formatted(userId, ym),
                snap.version(),
                snap,
                draftService.ttlSeconds()
        );
    }


    @Operation(
            summary = "예산설정 완료",
            description = "예산설정 마지막 단계: Redis 초안을 DB에 확정 저장합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "커밋 성공"),
            @ApiResponse(responseCode = "409", description = "이미 커밋됨/버전 충돌"),
            @ApiResponse(responseCode = "422", description = "검증 실패"),
            @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    // BD-6 마지막 버튼 (commit)
    @PostMapping("/commit")
    public BudgetCommitResponse commit(
                                       @RequestBody BudgetCommitRequest req) {
        Long userId =SecurityUtils.currentUserIdOrNull();
        String ym = ymResolver.nowYm();                       // ✅ 항상 현재 달
        return commitService.commit(userId, ym, req.expectedVersion());
    }
}
