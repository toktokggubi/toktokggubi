package com.ssafy.toktokggubi.domain.budget.controller;

import com.ssafy.toktokggubi.domain.budget.dto.*;
import com.ssafy.toktokggubi.domain.budget.service.BudgetCommitService;
import com.ssafy.toktokggubi.domain.budget.service.BudgetDraftService;
import com.ssafy.toktokggubi.domain.budget.service.BudgetReadService;
import com.ssafy.toktokggubi.domain.budget.service.BudgetRecommendService;
import com.ssafy.toktokggubi.domain.gms.service.AiBudgetService;
import com.ssafy.toktokggubi.domain.gms.service.AiSuggestService;
import com.ssafy.toktokggubi.domain.gms.service.GmsTextService;
import com.ssafy.toktokggubi.domain.report.service.AiReportInformationService;
import com.ssafy.toktokggubi.domain.user.repository.UserRepository;
import com.ssafy.toktokggubi.global.security.utils.SecurityUtils;
import com.ssafy.toktokggubi.global.time.YmResolver;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

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
    private final AiReportInformationService reportInfoService; // 이미 있는 서비스(값 조회)
    private final AiBudgetService aiBudgetService;
    private final UserRepository userRepository;
    private final BudgetRecommendService budgetRecommendService;

    /**
     * selected이 비면 allocations의 카테고리로 채우고, null 리스트는 빈 리스트로 치환
     */
    private static BudgetAllSaveRequestDto normalize(BudgetAllSaveRequestDto req) {
        List<Long> selected = (req.selectedCategories() == null || req.selectedCategories().isEmpty())
                ? (req.categoryAllocations() == null ? List.of()
                : req.categoryAllocations().stream().map(CategoryAllocDto::categoryId).distinct().toList())
                : req.selectedCategories();

        return new BudgetAllSaveRequestDto(
                req.totalAmount(),
                req.fixedExpenses() == null ? List.of() : req.fixedExpenses(),
                selected,
                req.categoryAllocations() == null ? List.of() : req.categoryAllocations()
        );
    }

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
        String ym = ymResolver.nowYm();

        DraftPatchRequestDto saveOnlyCategories = new DraftPatchRequestDto(
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
        Long userId = SecurityUtils.currentUserIdOrNull();
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
            long rem = (n > 0) ? (pool - base * n) : 0L;
            for (int i = 0; i < n; i++) {
                long v = base + (i < rem ? 1 : 0);
                allocMapByName.put(namesOrdered.get(i), v);
            }
        }


        List<CategoryAllocDto> allocDtos = new java.util.ArrayList<>(selectedIds.size());
        for (Long id : selectedIds) {
            String name = namesById.getOrDefault(id, "카테고리#" + id);
            long amt = Math.max(0L, allocMapByName.getOrDefault(name, 0L));
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

    /**
     * 추천안 저장/덮어쓰기(전월 기본).
     * - ym 미지정 시: prevYm()
     * - 동일 (user, ym) 존재 시: 기존 UserMonthlyBudget 삭제 → 신규 생성 (CASCADE로 종속 삭제)
     */
    @PostMapping("/all/recommend")
    public BudgetSaveResponseDto saveFrontRecommend(@RequestBody @Valid BudgetAllSaveRequestDto req) {
        Long userId = SecurityUtils.currentUserIdOrNull();
        if (userId == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        return budgetRecommendService.saveOrUpdateMonthlyBudget(userId, ymResolver.nowYm(), req);
    }


}
