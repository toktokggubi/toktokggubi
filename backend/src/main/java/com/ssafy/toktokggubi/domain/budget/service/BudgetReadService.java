package com.ssafy.toktokggubi.domain.budget.service;


import com.ssafy.toktokggubi.domain.budget.dto.*;
import com.ssafy.toktokggubi.domain.budget.entity.UserMonthlyBudget;
import com.ssafy.toktokggubi.domain.budget.repository.BudgetCategoryRepository;
import com.ssafy.toktokggubi.domain.budget.repository.FixedExpenseRepository;
import com.ssafy.toktokggubi.domain.budget.repository.UserMonthlyBudgetRepository;
import com.ssafy.toktokggubi.domain.category.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BudgetReadService {
    private static final DateTimeFormatter YM = DateTimeFormatter.ofPattern("yyyyMM");
    private final CategoryRepository categoryRepository;
    private final UserMonthlyBudgetRepository umbRepo;
    private final FixedExpenseRepository fixedExpenseRepository;
    private final BudgetCategoryRepository budgetCategoryRepository;

    public Map<Long, String> getCategoryNamesByIds(List<Long> ids) {
        // JPA findAllById 결과 → 임시 맵
        Map<Long, String> tmp = categoryRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(
                        c -> c.getCategoryId(),            // ← 메서드 레퍼런스 대신 람다
                        c -> c.getName(),
                        (a, b) -> a                        // 중복 키가 있어도 첫 값 유지
                ));

        // 입력 ids 순서를 그대로 유지한 맵으로 반환 (없으면 null)
        LinkedHashMap<Long, String> ordered = new LinkedHashMap<>();
        for (Long id : ids) {
            ordered.put(id, tmp.get(id));
        }
        return ordered;
    }

    /**
     * yyyyMM의 이전 달(yyyyMM) 계산
     */
    private String prevYm(String ym) {
        YearMonth cur = YearMonth.parse(ym, YM);
        return cur.minusMonths(1).format(YM);
    }

    @Transactional(readOnly = true)
    public TotalAmountResponseDto getTotalAmount(Long userId, String budgetYm) {
        var umb = umbRepo.findByUser_UserIdAndBudgetYm(userId, budgetYm)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "userId=" + userId + ", budgetYm=" + budgetYm + " not found"));

        return new TotalAmountResponseDto(umb.getTotalAmount());
    }

    @Transactional(readOnly = true)
    public FixedIncludedTotalResponseDto getFixedIncludedTotal(Long userId, String budgetYm) {
        var umb = umbRepo.findByUser_UserIdAndBudgetYm(userId, budgetYm)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "userId=" + userId + ", budgetYm=" + budgetYm + " not found"));

        var items = fixedExpenseRepository.findByUserMonthlyBudget(umb);

        long sum = items.stream()
                .filter(fe -> fe.getIncludeInBudget() == null || fe.getIncludeInBudget())
                .mapToLong(fe -> fe.getAmount() == null ? 0L : fe.getAmount())
                .sum();

        return new FixedIncludedTotalResponseDto(sum);
    }

    @Transactional(readOnly = true)
    public FirstAmountResponseDto getFirstAmount(Long userId, String budgetYm) {
        UserMonthlyBudget umb = umbRepo.findByUser_UserIdAndBudgetYm(userId, budgetYm)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "userId=" + userId + ", budgetYm=" + budgetYm + " not found"));

        var fixedList = fixedExpenseRepository.findByUserMonthlyBudget(umb);
        long fixedIncluded = fixedList.stream()
                .filter(fe -> fe.getIncludeInBudget() == null || fe.getIncludeInBudget())
                .mapToLong(fe -> fe.getAmount() == null ? 0L : fe.getAmount())
                .sum();

        long firstAmount = (umb.getTotalAmount() == null ? 0L : umb.getTotalAmount()) + fixedIncluded;
        return new FirstAmountResponseDto(firstAmount);
    }

    @Transactional(readOnly = true)
    public List<FixedExpenseDto> getFixedList(Long userId, String budgetYm) {
        var umb = umbRepo.findByUser_UserIdAndBudgetYm(userId, budgetYm)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "userId=" + userId + ", budgetYm=" + budgetYm + " not found"));

        return fixedExpenseRepository.findByUserMonthlyBudget(umb).stream()
                .map(fe -> new FixedExpenseDto(
                        fe.getTitle(),
                        fe.getAmount(),
                        fe.getPaymentDay() == null ? null : fe.getPaymentDay().intValue(),
                        fe.getIncludeInBudget()
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CategoryAllocDto> getCategoryAllocations(Long userId, String budgetYm) {
        UserMonthlyBudget umb = umbRepo.findByUser_UserIdAndBudgetYm(userId, budgetYm)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "userId=" + userId + ", budgetYm=" + budgetYm + " not found"));

        return budgetCategoryRepository.findByUserMonthlyBudget(umb).stream()
                .map(bc -> new CategoryAllocDto(
                        bc.getUserSelectedCategory().getCategory().getCategoryId(),
                        bc.getFinalAmount() == null ? 0L : bc.getFinalAmount()
                ))
                .toList();
    }
    // ====== 🔽🔽 여기서부터 "이전 달" 전용 ======

    @Transactional(readOnly = true)
    public TotalAmountResponseDto getPreviousTotalAmount(Long userId, String currentYm) {
        String prev = prevYm(currentYm);
        return getTotalAmount(userId, prev);
    }

    @Transactional(readOnly = true)
    public FixedIncludedTotalResponseDto getPreviousFixedIncludedTotal(Long userId, String currentYm) {
        String prev = prevYm(currentYm);
        return getFixedIncludedTotal(userId, prev);
    }

    @Transactional(readOnly = true)
    public List<FixedExpenseDto> getPreviousFixedList(Long userId, String currentYm) {
        String prev = prevYm(currentYm);
        return getFixedList(userId, prev);
    }
}
