package com.ssafy.toktokggubi.domain.budget.controller;

import com.ssafy.toktokggubi.domain.budget.dto.*;
import com.ssafy.toktokggubi.domain.budget.service.BudgetCommitService;
import com.ssafy.toktokggubi.domain.budget.service.BudgetDraftService;

import com.ssafy.toktokggubi.global.security.utils.SecurityUtils;
import com.ssafy.toktokggubi.global.time.YmResolver;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;


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
    public DraftSaveResponseDto saveDraftTotal(
            @RequestBody DraftTotalRequestDto req) {


        Long userId = SecurityUtils.currentUserIdOrNull();
        String ym = ymResolver.nowYm();


        DraftPatchRequestDto patch = new DraftPatchRequestDto(
                null,                       // expectedVersion 없음
                req.totalAmount(),          // totalAmount만 세팅
                null, null, null
        );
        return doSave(userId, patch);
    }

    @PostMapping("/draft/save/fixed")
    public DraftSaveResponseDto saveDraftFixed(
                                            @RequestBody DraftFixedRequestDto req) {
        Long userId = SecurityUtils.currentUserIdOrNull();
        DraftPatchRequestDto patch = new DraftPatchRequestDto(
                req.expectedVersion(),
                null,
                req.fixedExpenses(),
                null,
                null
        );
        return doSave(userId, patch);
    }

    @PostMapping("/draft/save/categories")
    public DraftSaveResponseDto saveDraftCategories(

                                                 @RequestBody DraftCategoriesRequestDto req) {
        Long userId = SecurityUtils.currentUserIdOrNull();
        DraftPatchRequestDto patch = new DraftPatchRequestDto(
                req.expectedVersion(),
                null,
                null,
                req.selectedCategories(),
                req.categoryAllocations()
        );
        return doSave(userId, patch);
    }

    /* 공통 저장 로직 (현재 달 고정) */
    /* 공통 저장 로직 (현재 달 고정) */
    private DraftSaveResponseDto doSave(Long userId, DraftPatchRequestDto req) {
        String ym = ymResolver.nowYm();
        var snap = draftService.mergeAndSave(userId, ym, req);
        return new DraftSaveResponseDto(
                "budget:draft:%d:%s".formatted(userId, ym),
                snap.version(),
                snap,
                draftService.ttlSeconds()
        );
    }

    // BD-6 마지막 버튼 (commit)
    @PostMapping("/commit")
    public BudgetCommitResponseDto commit(
            ) {
        Long userId =SecurityUtils.currentUserIdOrNull();
        String ym = ymResolver.nowYm();                       // ✅ 항상 현재 달
        return commitService.commit(userId, ym, null);
    }
}
