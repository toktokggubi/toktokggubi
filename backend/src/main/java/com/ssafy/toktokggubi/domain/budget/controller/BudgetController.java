package com.ssafy.toktokggubi.domain.budget.controller;

import com.ssafy.toktokggubi.domain.budget.dto.*;
import com.ssafy.toktokggubi.domain.budget.service.BudgetCommitService;
import com.ssafy.toktokggubi.domain.budget.service.BudgetDraftService;

import com.ssafy.toktokggubi.domain.budget.service.BudgetReadService;
import com.ssafy.toktokggubi.global.security.utils.SecurityUtils;
import com.ssafy.toktokggubi.global.time.YmResolver;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/budget")
@RequiredArgsConstructor
@Tag(name = "예산관리", description = "예산관리 관련 API")
public class BudgetController {

    private final BudgetDraftService draftService;
    private final BudgetCommitService commitService;
    private final YmResolver ymResolver;
    private final BudgetReadService budgetReadService;

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
        String ym = ymResolver.nowYm();
        return commitService.commit(userId, ym, null);
    }
    @GetMapping("/total")
    public TotalAmountResponseDto getTotalAmountNow() {
        Long userId = SecurityUtils.currentUserIdOrNull();
        String ym = ymResolver.nowYm();
        return budgetReadService.getTotalAmount(userId, ym);
    }

    @GetMapping("/fixed")
    public FixedIncludedTotalResponseDto getFixedIncludedTotalNow() {
        Long userId = SecurityUtils.currentUserIdOrNull();
        String ym = ymResolver.nowYm();
        return budgetReadService.getFixedIncludedTotal(userId, ym);
    }
    @GetMapping("/first")
    public FirstAmountResponseDto getFirstAmountNow() {
        Long userId = SecurityUtils.currentUserIdOrNull();
        String ym = ymResolver.nowYm();
        return budgetReadService.getFirstAmount(userId, ym);
    }
    @GetMapping("/fixed/list")
    public List<FixedExpenseDto> getFixedListNow() {
        Long userId = SecurityUtils.currentUserIdOrNull();
        String ym = ymResolver.nowYm();
        return budgetReadService.getFixedList(userId, ym);
    }
    @GetMapping("/category")
    public List<CategoryAllocDto> getCategoryAllocationsNow() {
        Long userId = SecurityUtils.currentUserIdOrNull();
        String ym = ymResolver.nowYm();
        return budgetReadService.getCategoryAllocations(userId, ym);
    }

    @GetMapping("/previous/total")
    public TotalAmountResponseDto getTotalAmountBefore() {
        Long userId = SecurityUtils.currentUserIdOrNull();
        String ym = ymResolver.nowYm();
        return budgetReadService.getPreviousTotalAmount(userId, ym);
    }

    @GetMapping("/previous/fixed")
    public FixedIncludedTotalResponseDto getFixedIncludedTotalBefore() {
        Long userId = SecurityUtils.currentUserIdOrNull();
        String ym = ymResolver.nowYm();
        return budgetReadService.getPreviousFixedIncludedTotal(userId, ym);
    }

    @GetMapping("/previous/fixed/list")
    public List<FixedExpenseDto> getFixedListBefore() {
        Long userId = SecurityUtils.currentUserIdOrNull();
        String ym = ymResolver.nowYm();
        return budgetReadService.getPreviousFixedList(userId, ym);
    }
    @PostMapping("/all/commit")
    public BudgetCommitResponseDto saveAllAtOnce(@RequestBody BudgetAllSaveRequestDto req) {
        Long userId = SecurityUtils.currentUserIdOrNull();
        String ym   = ymResolver.nowYm();

        // 0) selectedCategories 보정
        BudgetAllSaveRequestDto normalized = normalizeAllSave(req);

        // 1) expectedVersion=null 로 고정하여 버전 체크 스킵
        DraftPatchRequestDto patch = new DraftPatchRequestDto(
                null, // ★ 버전 체크 건너뛰기
                normalized.totalAmount(),
                normalized.fixedExpenses(),
                normalized.selectedCategories(),
                normalized.categoryAllocations()
        );

        // 2) 드래프트에 병합 저장
        draftService.mergeAndSave(userId, ym, patch);

        // 3) 즉시 커밋(DB 반영)
        var committed = commitService.commit(userId, ym, null);

        // 4) 기존 응답 타입 재사용
        return BudgetCommitResponseDto.committed(
                committed.budgetId(),
                userId,
                ym,
                committed.totalAmount(),
                committed.fixedExpenseCount(),
                committed.categoryCount()
        );
    }

    private BudgetAllSaveRequestDto normalizeAllSave(BudgetAllSaveRequestDto req) {
        if (req == null) return new BudgetAllSaveRequestDto(null, null, null, null);

        var selected = req.selectedCategories();
        var allocs   = req.categoryAllocations();

        if ((selected == null || selected.isEmpty()) && allocs != null && !allocs.isEmpty()) {
            List<Long> derived = allocs.stream()
                    .map(CategoryAllocDto::categoryId)
                    .distinct()
                    .toList();
            return new BudgetAllSaveRequestDto(
                    req.totalAmount(),
                    req.fixedExpenses(),
                    derived,                 // ★ allocations에서 유도
                    req.categoryAllocations()
            );
        }
        return req;
    }

}
