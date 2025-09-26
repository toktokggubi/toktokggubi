package com.ssafy.toktokggubi.domain.budget.service;

import com.openai.errors.UnauthorizedException;
import com.ssafy.toktokggubi.domain.budget.dto.*;
import com.ssafy.toktokggubi.domain.budget.entity.BudgetCategory;
import com.ssafy.toktokggubi.domain.budget.entity.FixedExpense;
import com.ssafy.toktokggubi.domain.budget.entity.UserMonthlyBudget;
import com.ssafy.toktokggubi.domain.budget.entity.UserSelectedCategory;
import com.ssafy.toktokggubi.domain.budget.exception.BudgetErrorCode;
import com.ssafy.toktokggubi.domain.budget.exception.BudgetException;
import com.ssafy.toktokggubi.domain.budget.repository.BudgetCategoryRepository;
import com.ssafy.toktokggubi.domain.budget.repository.FixedExpenseRepository;
import com.ssafy.toktokggubi.domain.budget.repository.UserMonthlyBudgetRepository;
import com.ssafy.toktokggubi.domain.budget.repository.UserSelectedCategoryRepository;
import com.ssafy.toktokggubi.domain.category.entity.Category;
import com.ssafy.toktokggubi.domain.report.dto.request.AiBudgetAllSaveRequestDto;
import com.ssafy.toktokggubi.domain.user.entity.User;
import com.ssafy.toktokggubi.global.security.utils.SecurityUtils;
import com.ssafy.toktokggubi.global.time.YmResolver;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BudgetRecommendService {

    private final UserMonthlyBudgetRepository umbRepo;
    private final FixedExpenseRepository feRepo;
    private final BudgetCategoryRepository bcRepo;
    private final UserSelectedCategoryRepository uscRepo;
    private final YmResolver ymResolver;

    @PersistenceContext
    private EntityManager em;

    /**
     * AI가 보낸 추천안 저장 (임시안/전월안). 같은 ym이 이미 존재하면 업데이트.
     * totalAmount는 "총예산(고정지출 포함)"으로 그대로 저장한다. (커밋 시 조정은 BudgetCommitService가 담당)
     */

    @Transactional
    public BudgetSaveResponseDto saveRecommendedBudget(AiBudgetAllSaveRequestDto dto) {
        Objects.requireNonNull(dto, "dto is null");
        Objects.requireNonNull(dto.totalAmount(), "totalAmount is null");

        // ✅ 비인증 허용: dto.userId 필수
        Long targetUserId = Objects.requireNonNull(dto.userId(), "userId is required for /ai calls");


        String budgetYm = ymResolver.nowYm();
        if (budgetYm == null || !budgetYm.matches("\\d{6}")) {
            throw new IllegalStateException("ym 포맷 오류(YYYYMM)");
        }

        // 2) 이미 존재하면: 아무 것도 하지 않음
        Optional<UserMonthlyBudget> existing = umbRepo.findByUser_UserIdAndBudgetYm(targetUserId, budgetYm);
        if (existing.isPresent()) {
            return new BudgetSaveResponseDto(
                    budgetYm,
                    existing.get().getUserMonthlyBudgetId(),
                    0, // fixedExpenseCount
                    0  // budgetCategoryCount
            );
        }

        // 3) UMB 신규 생성 (경합 시 유니크 충돌 → 재조회 후 스킵 응답)
        User userRef = em.getReference(User.class, targetUserId);
        UserMonthlyBudget umb;
        try {
            umb = umbRepo.save(
                    UserMonthlyBudget.builder()
                            .user(userRef)
                            .budgetYm(budgetYm)
                            .totalAmount(dto.totalAmount()) // 추천 총예산(고정 포함)
                            .isActive(true)
                            .build()
            );
        } catch (DataIntegrityViolationException race) {
            Long umbId = umbRepo.findByUser_UserIdAndBudgetYm(targetUserId, budgetYm)
                    .map(UserMonthlyBudget::getUserMonthlyBudgetId)
                    .orElseThrow(() -> race);
            return new BudgetSaveResponseDto(budgetYm, umbId, 0, 0);
        }

        // 4) 고정지출 저장 (요청 그대로)
        int feCount = 0;
        if (dto.fixedExpenses() != null && !dto.fixedExpenses().isEmpty()) {
            var feList = dto.fixedExpenses().stream()
                    .map(f -> FixedExpense.builder()
                            .userMonthlyBudget(umb)
                            .title(f.title())
                            .amount(f.amount())
                            .includeInBudget(f.includeInBudget())
                            .paymentDay(f.payDay() == null ? null : f.payDay().byteValue())
                            .build())
                    .toList();
            if (!feList.isEmpty()) {
                feRepo.saveAll(new ArrayList<>(feList));
                feCount = feList.size();
            }
        }

        // 5) 배분 저장 (요청 내 중복 병합 + USC 업서트, UMB 신규이므로 업데이트 없음)
        int bcCount = 0;
        if (dto.categoryAllocations() != null && !dto.categoryAllocations().isEmpty()) {
            // 같은 categoryId가 여러 번 오면 마지막 값만 반영
            Map<Long, Long> merged = new LinkedHashMap<>();
            for (CategoryAllocDto a : dto.categoryAllocations()) {
                merged.put(a.categoryId(), a.finalAmount());
            }

            Map<Long, UserSelectedCategory> uscCache = new HashMap<>();
            Set<Long> insertedUscIds = new HashSet<>();

            for (Map.Entry<Long, Long> e : merged.entrySet()) {
                Long cid = e.getKey();
                Long amount = e.getValue();

                // USC 업서트 (userId, categoryId)
                UserSelectedCategory usc = uscCache.computeIfAbsent(cid, key ->
                        uscRepo.findByUser_UserIdAndCategory_CategoryId(targetUserId, key)
                                .orElseGet(() -> {
                                    try {
                                        Category categoryRef = em.getReference(Category.class, key);
                                        return uscRepo.save(UserSelectedCategory.builder()
                                                .user(userRef)
                                                .category(categoryRef)
                                                .build());
                                    } catch (DataIntegrityViolationException race) {
                                        return uscRepo.findByUser_UserIdAndCategory_CategoryId(targetUserId, key)
                                                .orElseThrow(() -> race);
                                    }
                                })
                );

                // 같은 UMB 내 동일 USC 두 번 방지(요청 중복 대비)
                if (!insertedUscIds.add(usc.getUserSelectedCategoryId())) continue;

                bcRepo.save(BudgetCategory.builder()
                        .userMonthlyBudget(umb)
                        .userSelectedCategory(usc)
                        .finalAmount(amount)
                        .build());
                bcCount++;
            }
        }

        // 6) 응답
        return new BudgetSaveResponseDto(
                budgetYm,
                umb.getUserMonthlyBudgetId(),
                feCount,
                bcCount
        );
    }
    @Transactional
    public BudgetSaveResponseDto saveOrUpdateMonthlyBudget(Long userId, String budgetYm, BudgetAllSaveRequestDto dto) {
        Objects.requireNonNull(userId, "userId is null");
        Objects.requireNonNull(dto, "dto is null");
        Objects.requireNonNull(dto.totalAmount(), "totalAmount is null");
        ensureYm(budgetYm);

        User userRef = em.getReference(User.class, userId);

        // ✅ isActive 조건 제거: 존재하면 그걸 '수정', 없으면 '생성'
        UserMonthlyBudget umb = umbRepo.findByUser_UserIdAndBudgetYm(userId, budgetYm)
                .orElse(null);

        if (umb == null) {
            // 없으면 새로 생성
            umb = umbRepo.save(UserMonthlyBudget.builder()
                    .user(userRef)
                    .budgetYm(budgetYm)
                    .isActive(true)
                    .totalAmount(dto.totalAmount())
                    .build());
        } else {
            // 있으면 수정(merge). @Builder(toBuilder = true)라면 ID가 복사되어 update로 동작
            umb = umbRepo.save(umb.toBuilder()
                    .isActive(true)
                    .totalAmount(dto.totalAmount())
                    .build());
        }

        // 고정지출 치환
        feRepo.deleteByUserMonthlyBudget(umb);
        em.flush(); // 삭제 즉시 반영
        int feCount = saveFixedExpenses(umb, dto.fixedExpenses());

        // 배분 치환
        bcRepo.deleteByUserMonthlyBudget(umb);
        em.flush(); // 삭제 즉시 반영
        int bcCount = insertAllBudgetCategories(umb, userId, userRef, dto.categoryAllocations());

        return new BudgetSaveResponseDto(budgetYm, umb.getUserMonthlyBudgetId(), feCount, bcCount);
    }

    /* ----------------- helpers ----------------- */

    private void ensureYm(String ym) {
        if (ym == null || !ym.matches("\\d{6}")) {
            throw new IllegalStateException("ym 포맷 오류(YYYYMM)");
        }
    }

    private int saveFixedExpenses(UserMonthlyBudget umb, List<FixedExpenseDto> list) {
        if (list == null || list.isEmpty()) return 0;
        var toSave = list.stream().map(f -> FixedExpense.builder()
                .userMonthlyBudget(umb)
                .title(f.title())
                .amount(f.amount())
                .includeInBudget(f.includeInBudget())
                .paymentDay(f.payDay() == null ? null : f.payDay().byteValue())
                .build()).toList();
        feRepo.saveAll(new ArrayList<>(toSave));
        return toSave.size();
    }
    /** 배분(프론트용 replace-all): 전달받은 allocation 전부 insert */
    private int insertAllBudgetCategories(UserMonthlyBudget umb, Long userId, User userRef,
                                          List<CategoryAllocDto> allocs) {
        if (allocs == null || allocs.isEmpty()) return 0;

        // 1) 같은 categoryId가 여러 번 오면 마지막 값만 반영
        Map<Long, Long> merged = new LinkedHashMap<>();
        for (CategoryAllocDto a : allocs) merged.put(a.categoryId(), a.finalAmount());

        // 2) USC 캐시 + 이번 요청 내 삽입 중복 방지
        Map<Long, UserSelectedCategory> uscCache = new HashMap<>();
        Set<Long> insertedUscIds = new HashSet<>();

        int count = 0;
        for (Map.Entry<Long, Long> e : merged.entrySet()) {
            Long cid = e.getKey();
            Long amount = e.getValue();

            UserSelectedCategory usc = uscCache.computeIfAbsent(cid, key -> upsertUsc(userId, userRef, key));

            // 이번 요청 내에서 같은 USC 두 번 방지
            if (!insertedUscIds.add(usc.getUserSelectedCategoryId())) {
                continue; // 이미 넣었음
            }

            // 예외 catch 하지 말고, 중복이 발생하지 않도록 로직으로 보장
            bcRepo.save(BudgetCategory.builder()
                    .userMonthlyBudget(umb)
                    .userSelectedCategory(usc)
                    .finalAmount(amount)
                    .build());
            count++;
        }
        return count;
    }
    private int insertNewBudgetCategoriesOnly(UserMonthlyBudget umb, Long userId, User userRef,
                                              List<CategoryAllocDto> allocs) {
        if (allocs == null || allocs.isEmpty()) return 0;

        // 기존 UMB의 USC 집합
        Set<Long> existingUscIds = bcRepo.findByUserMonthlyBudget(umb).stream()
                .map(bc -> bc.getUserSelectedCategory().getUserSelectedCategoryId())
                .collect(Collectors.toSet());

        Map<Long, UserSelectedCategory> uscCache = new HashMap<>();
        int count = 0;
        for (var a : allocs) {
            Long cid = a.categoryId();
            UserSelectedCategory usc = uscCache.computeIfAbsent(cid, key -> upsertUsc(userId, userRef, key));

            if (existingUscIds.contains(usc.getUserSelectedCategoryId())) continue; // 중복 스킵

            try {
                bcRepo.save(BudgetCategory.builder()
                        .userMonthlyBudget(umb)
                        .userSelectedCategory(usc)
                        .finalAmount(a.finalAmount())
                        .build());
                existingUscIds.add(usc.getUserSelectedCategoryId());
                count++;
            } catch (DataIntegrityViolationException ignore) {
                // UNIQUE(umb, usc) 충돌 → 스킵
            }
        }
        return count;
    }

    /** USC 즉석 업서트: (user, category) 없으면 생성 */
    private UserSelectedCategory upsertUsc(Long userId, User userRef, Long categoryId) {
        return uscRepo.findByUser_UserIdAndCategory_CategoryId(userId, categoryId)
                .orElseGet(() -> {
                    try {
                        var categoryRef = em.getReference(Category.class, categoryId);
                        return uscRepo.save(UserSelectedCategory.builder()
                                .user(userRef).category(categoryRef).build());
                    } catch (DataIntegrityViolationException e) {
                        return uscRepo.findByUser_UserIdAndCategory_CategoryId(userId, categoryId)
                                .orElseThrow(() -> e);
                    }
                });
    }

}
