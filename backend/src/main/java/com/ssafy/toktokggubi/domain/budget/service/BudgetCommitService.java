package com.ssafy.toktokggubi.domain.budget.service;

import com.ssafy.toktokggubi.domain.budget.dto.CategoryAllocDto;
import com.ssafy.toktokggubi.domain.budget.dto.BudgetCommitResponseDto;
import com.ssafy.toktokggubi.domain.budget.dto.DraftSnapshotDto;
import com.ssafy.toktokggubi.domain.budget.dto.FixedExpenseDto;
import com.ssafy.toktokggubi.domain.budget.entity.BudgetCategory;
import com.ssafy.toktokggubi.domain.budget.entity.FixedExpense;
import com.ssafy.toktokggubi.domain.budget.entity.UserMonthlyBudget;
import com.ssafy.toktokggubi.domain.budget.entity.UserSelectedCategory;
import com.ssafy.toktokggubi.domain.budget.exception.BudgetException;
import com.ssafy.toktokggubi.domain.budget.exception.BudgetErrorCode;

import com.ssafy.toktokggubi.domain.budget.repository.BudgetCategoryRepository;
import com.ssafy.toktokggubi.domain.budget.repository.FixedExpenseRepository;
import com.ssafy.toktokggubi.domain.budget.repository.UserMonthlyBudgetRepository;
import com.ssafy.toktokggubi.domain.budget.repository.UserSelectedCategoryRepository;
import com.ssafy.toktokggubi.domain.category.entity.Category;
import com.ssafy.toktokggubi.domain.user.entity.User;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;
import java.util.function.Function;

@Service
@RequiredArgsConstructor
public class BudgetCommitService {

    private final BudgetDraftService draftService;
    private final UserMonthlyBudgetRepository umbRepo;
    private final FixedExpenseRepository feRepo;
    private final BudgetCategoryRepository bcRepo;
    private final UserSelectedCategoryRepository uscRepo;

    @PersistenceContext               // ★ EntityManager 주입 (조회 없이 FK 참조용)
    private EntityManager em;

    @Transactional
    public BudgetCommitResponseDto commit(Long userId, String budgetYm, Integer expectedVersion) {

        // 1) 중복 커밋 방지 (User 로드 없이 검사)
        if (umbRepo.existsByUser_UserIdAndBudgetYm(userId, budgetYm)) {
            throw new IllegalStateException("budget already exists for " + budgetYm);
        }

        // 2) Draft 로드 + 버전 확인
        DraftSnapshotDto snap = draftService.getOrCreate(userId, budgetYm);
        if (expectedVersion != null && !expectedVersion.equals(snap.version())) {
            throw new IllegalStateException("version mismatch: expected=" + expectedVersion + ", actual=" + snap.version());
        }
        if (snap.totalAmount() == null || snap.totalAmount() <= 0) {
            throw new IllegalArgumentException("totalAmount required (> 0)");
        }

        // 3) 합계 검증
        long fixedInBudget = Optional.ofNullable(snap.fixedExpenses()).orElseGet(ArrayList::new).stream()
                .filter(f -> f.includeInBudget() == null || f.includeInBudget())
                .mapToLong(FixedExpenseDto::amount)
                .sum();
        long adjustedTotal = snap.totalAmount() - fixedInBudget;
        if (adjustedTotal < 0) {
            throw new BudgetException(BudgetErrorCode.BUDGET_OVERFLOW,
                    "fixed expenses exceed total amount",
                    Map.of("total", snap.totalAmount(), "fixedInBudget", fixedInBudget));
        }
        long categorySum = Optional.ofNullable(snap.categoryAllocations()).orElseGet(ArrayList::new).stream()
                .mapToLong(CategoryAllocDto::finalAmount)
                .sum();
        long available = snap.totalAmount() - fixedInBudget;
        if (categorySum > available) {
            throw new IllegalArgumentException("category allocations exceed available amount: " + categorySum + " > " + available);
        }

        try {
            // 4) User 엔티티 '조회 없이' FK 참조만 생성
            User userRef = em.getReference(User.class, userId); // SELECT 발생 안 함

            // 5) UMB 저장
            UserMonthlyBudget umb = umbRepo.save(UserMonthlyBudget.builder()
                    .user(userRef)                  //user 대신 userRef 사용
                    .budgetYm(budgetYm)
                    .totalAmount(adjustedTotal)
                    .isActive(true)
                    .build());

            // 6) 고정지출: 기존 삭제 후 삽입
            feRepo.deleteByUserMonthlyBudget(umb);
            em.flush();
            var feList = Optional.ofNullable(snap.fixedExpenses()).orElseGet(ArrayList::new).stream()
                    .map(f -> FixedExpense.builder()
                            .userMonthlyBudget(umb)
                            .title(f.title())
                            .amount(f.amount())
                            .includeInBudget(f.includeInBudget() == null ? Boolean.TRUE : f.includeInBudget())
                            .paymentDay(f.payDay() == null ? null : f.payDay().byteValue())
                            .build())
                    .toList();
            feRepo.saveAll(new ArrayList<>(feList));


            var requiredCatIds = resolveRequiredCategoryIds(snap); // 아래 helper 참고
            var uscMap = upsertUserSelections(userId, requiredCatIds); // 카테고리ID -> USC

            // 7) 카테고리 배분
            bcRepo.deleteByUserMonthlyBudget(umb);
            em.flush();
            int catCnt = 0;
            for (var c : Optional.ofNullable(snap.categoryAllocations()).orElseGet(ArrayList::new)) {
                var usc = uscRepo.findByUser_UserIdAndCategory_CategoryId(userId, c.categoryId())
                        .orElseThrow(() -> new IllegalArgumentException("user did not select category: " + c.categoryId()));

                bcRepo.save(BudgetCategory.builder()
                        .userMonthlyBudget(umb)
                        .userSelectedCategory(usc)
                        .finalAmount(c.finalAmount())
                        .build());
                catCnt++;
            }

            // 8) Draft 정리
            draftService.delete(userId, budgetYm);

            // 9) 응답
            return BudgetCommitResponseDto.committed(
                    umb.getUserMonthlyBudgetId(),
                    userId,
                    budgetYm,
                    adjustedTotal,
                    feList.size(),
                    catCnt
            );
        } catch (DataIntegrityViolationException e) {
            throw new IllegalStateException("duplicate commit for " + budgetYm, e);
        }
    }
    /** Redis 스냅샷에서 필요한 카테고리 집합 도출 */
    private Set<Long> resolveRequiredCategoryIds(DraftSnapshotDto snap) {
        var allocIds = Optional.ofNullable(snap.categoryAllocations()).orElseGet(List::of)
                .stream().map(CategoryAllocDto::categoryId).collect(Collectors.toSet());
        var selectedIds = new HashSet<>(Optional.ofNullable(snap.selectedCategories()).orElseGet(List::of));

        // selected가 비어있으면 배분 목록으로 대체
        if (selectedIds.isEmpty()) selectedIds.addAll(allocIds);

        // 일관성 체크: 배분된 카테고리는 반드시 선택에 포함되어야 함
        if (!selectedIds.containsAll(allocIds)) {
            throw new BudgetException(BudgetErrorCode.CATEGORIES_INVALID, "allocation includes unselected categories",
                    Map.of("selected", selectedIds, "allocOnly", diff(allocIds, selectedIds)));
        }
        return selectedIds;
    }

    private static Set<Long> diff(Set<Long> a, Set<Long> b) {
        var r = new HashSet<>(a);
        r.removeAll(b);
        return r;
    }

    /** 필요한 USC를 모두 보장하고, categoryId -> USC 맵으로 반환 */
    private Map<Long, UserSelectedCategory> upsertUserSelections(Long userId, Set<Long> catIds) {
        if (catIds.isEmpty()) return Map.of();

        // 이미 있는 것들 조회
        var existing = uscRepo.findByUser_UserIdAndCategory_CategoryIdIn(userId, catIds);
        var map = existing.stream().collect(Collectors.toMap(
                usc -> usc.getCategory().getCategoryId(), Function.identity()
        ));

        // 없는 것들 생성
        var toCreate = new ArrayList<UserSelectedCategory>();
        for (Long cid : catIds) {
            if (!map.containsKey(cid)) {
                var usc = UserSelectedCategory.builder()
                        .user(em.getReference(User.class, userId))
                        .category(em.getReference(Category.class, cid))
                        .build();
                toCreate.add(usc);
            }
        }
        if (!toCreate.isEmpty()) {
            var saved = uscRepo.saveAll(toCreate);
            for (var usc : saved) {
                map.put(usc.getCategory().getCategoryId(), usc);
            }
        }
        return map;
    }
}

