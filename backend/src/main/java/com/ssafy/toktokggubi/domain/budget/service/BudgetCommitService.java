package com.ssafy.toktokggubi.domain.budget.service;

import com.ssafy.toktokggubi.domain.budget.dto.CategoryAllocDto;
import com.ssafy.toktokggubi.domain.budget.dto.BudgetCommitResponse;
import com.ssafy.toktokggubi.domain.budget.dto.DraftSnapshotDto;
import com.ssafy.toktokggubi.domain.budget.dto.FixedExpenseDto;
import com.ssafy.toktokggubi.domain.budget.entity.BudgetCategory;
import com.ssafy.toktokggubi.domain.budget.entity.FixedExpense;
import com.ssafy.toktokggubi.domain.budget.entity.UserMonthlyBudget;
import com.ssafy.toktokggubi.domain.budget.repository.BudgetCategoryRepository;
import com.ssafy.toktokggubi.domain.budget.repository.FixedExpenseRepository;
import com.ssafy.toktokggubi.domain.budget.repository.UserMonthlyBudgetRepository;
import com.ssafy.toktokggubi.domain.budget.repository.UserSelectedCategoryRepository;
import com.ssafy.toktokggubi.domain.user.entity.User; // ★ 중요

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Optional;

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
    public BudgetCommitResponse commit(Long userId, String budgetYm, Integer expectedVersion) {

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
                    .user(userRef)                  // ★ user 대신 userRef 사용
                    .budgetYm(budgetYm)
                    .totalAmount(snap.totalAmount())
                    .isActive(true)
                    .build());

            // 6) 고정지출: 기존 삭제 후 삽입
            feRepo.deleteByUserMonthlyBudget(umb);
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

            // 7) 카테고리 배분
            bcRepo.deleteByUserMonthlyBudget(umb);
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
            return BudgetCommitResponse.committed(
                    umb.getUserMonthlyBudgetId(),
                    userId,
                    budgetYm,
                    snap.totalAmount(),
                    feList.size(),
                    catCnt
            );
        } catch (DataIntegrityViolationException e) {
            throw new IllegalStateException("duplicate commit for " + budgetYm, e);
        }
    }
}
