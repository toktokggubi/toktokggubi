package com.ssafy.toktokggubi.domain.budget.controller;

import com.ssafy.toktokggubi.domain.budget.dto.*;
import com.ssafy.toktokggubi.domain.budget.service.BudgetCommitService;
import com.ssafy.toktokggubi.domain.budget.service.BudgetDraftService;

import com.ssafy.toktokggubi.domain.budget.service.BudgetReadService;
import com.ssafy.toktokggubi.domain.gms.service.AiSuggestService;
import com.ssafy.toktokggubi.domain.gms.service.GmsTextService;
import com.ssafy.toktokggubi.global.security.utils.SecurityUtils;
import com.ssafy.toktokggubi.global.time.YmResolver;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;


@Slf4j
@RestController
@RequestMapping("/budget")
@RequiredArgsConstructor
@Tag(name = "예산관리", description = "예산관리 관련 API")
public class BudgetController {

    private final BudgetDraftService draftService;
    private final BudgetCommitService commitService;
    private final YmResolver ymResolver;
    private final BudgetReadService budgetReadService;
private final AiSuggestService aiSuggestService;
private final GmsTextService gmsTextService;
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

                                                 @RequestBody DraftCategoriesSelectRequestDto req) {
        Long userId = SecurityUtils.currentUserIdOrNull();
        String ym   = ymResolver.nowYm();

        DraftPatchRequestDto saveOnlyCategories  = new DraftPatchRequestDto(
                req.expectedVersion(),
                null,
                null,
                req.selectedCategories(),
                null
        );
        var saved = draftService.mergeAndSave(userId, ym, saveOnlyCategories);

        // 2) 최신 스냅샷으로 자동 배분 실행 (LLM 무조건 호출, 실패 시 균등 분배)
        var autoAllocated = autoAllocateFromSnapshot(userId, ym, saved);

        return new DraftSaveResponseDto(
                "budget:draft:%d:%s".formatted(userId, ym),
                autoAllocated.version(),
                autoAllocated.snapshot(),
                draftService.ttlSeconds()
        );
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


    public DraftSaveResponseDto autoAllocateFromSnapshot(Long userId, String ym, DraftSnapshotDto snap) {
        long totalAmount = snap.totalAmount() == null ? 0L : snap.totalAmount();
        long fixedIncluded = (snap.fixedExpenses() == null) ? 0L :
                snap.fixedExpenses().stream()
                        .filter(FixedExpenseDto::includeInBudget)
                        .mapToLong(FixedExpenseDto::amount)
                        .sum();
        long pool = Math.max(totalAmount - fixedIncluded, 0L);

        var selectedIds = (snap.selectedCategories() == null) ? java.util.List.<Long>of() : snap.selectedCategories();
        if (selectedIds.isEmpty()) {
            // 선택된 카테고리가 아직 없으면 그대로 리턴
            return new DraftSaveResponseDto(
                    "budget:draft:%d:%s".formatted(userId, ym),
                    snap.version(),
                    snap,
                    draftService.ttlSeconds()
            );
        }

        // 1) 카테고리 이름 조회 (UI/LLM 프롬프트용)
        Map<Long, String> namesById = budgetReadService.getCategoryNamesByIds(selectedIds);

// 2) 선택된 ID 순서를 유지한 이름 리스트
        List<String> namesOrdered = new java.util.ArrayList<>(selectedIds.size());
        for (Long id : selectedIds) {
            namesOrdered.add(namesById.getOrDefault(id, "카테고리#" + id));
        }

        // 3) LLM으로 분배 제안(퍼센트→금액) 받아오기 (Optional<GmsTextService> 안전 처리)

        Map<String, Long> allocMapByName = java.util.Collections.emptyMap();
        try {
            if (gmsTextService != null) {
                allocMapByName = gmsTextService.suggestCategoryAllocations(namesOrdered, pool);
            }
        } catch (Exception e) {
            log.warn("[GMS] suggestCategoryAllocations fail", e);
        }

// 람다에서 사용할 final 복사(필요 시)
        final Map<String, Long> allocMapFinal = java.util.Collections.unmodifiableMap(allocMapByName);

        // 4) 폴백: LLM이 비었으면 균등 분배(반올림 잔차는 첫 항목에 보정)
        if (allocMapByName == null || allocMapByName.isEmpty()) {
            allocMapByName = new java.util.LinkedHashMap<>();
            int n = namesOrdered.size();
            long base = (n > 0) ? (pool / n) : 0L;
            long rem  = (n > 0) ? (pool - base * n) : 0L;
            for (int i = 0; i < n; i++) {
                long v = base + (i < rem ? 1 : 0);
                allocMapByName.put(namesOrdered.get(i), v);
            }
        }

// 5) id 매핑으로 CategoryAllocDto 리스트 구성
        List<CategoryAllocDto> allocDtos = new java.util.ArrayList<>(selectedIds.size());
        for (Long id : selectedIds) {
            String name = namesById.getOrDefault(id, "카테고리#" + id);
            long amt    = Math.max(0L, allocMapByName.getOrDefault(name, 0L));
            allocDtos.add(new CategoryAllocDto(id, amt));
        }
        // 6) 드래프트에 머지 저장
        DraftPatchRequestDto patch = new DraftPatchRequestDto(
                snap.version(),   // 낙관적 락
                null,
                null,
                selectedIds,
                allocDtos
        );
        var saved = draftService.mergeAndSave(userId, ym, patch);

        return new DraftSaveResponseDto(
                "budget:draft:%d:%s".formatted(userId, ym),
                saved.version(),
                saved,
                draftService.ttlSeconds()
        );
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
    @GetMapping("/ai/total/set")
    public TotalAmountResponseDto getAiSet() {
        Long userId = SecurityUtils.currentUserIdOrNull();
        return aiSuggestService.suggestLivingBudget(userId);
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
