package com.ssafy.toktokggubi.domain.budget.service;


import com.ssafy.toktokggubi.domain.budget.dto.*;

import com.ssafy.toktokggubi.domain.budget.entity.UserMonthlyBudget;
import com.ssafy.toktokggubi.domain.budget.repository.BudgetCategoryRepository;
import com.ssafy.toktokggubi.domain.budget.repository.FixedExpenseRepository;
import com.ssafy.toktokggubi.domain.budget.repository.UserMonthlyBudgetRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
// BudgetReadService.java (추가)
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class BudgetReadService {

    private final UserMonthlyBudgetRepository umbRepo;
private final FixedExpenseRepository fixedExpenseRepository;
    private final BudgetCategoryRepository budgetCategoryRepository;

    private static final DateTimeFormatter YM = DateTimeFormatter.ofPattern("yyyyMM");
    /** yyyyMM의 이전 달(yyyyMM) 계산 */
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
                .filter(fe -> fe.getIncludeInBudget() == null || Boolean.TRUE.equals(fe.getIncludeInBudget()))
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
                .filter(fe -> fe.getIncludeInBudget() == null || Boolean.TRUE.equals(fe.getIncludeInBudget()))
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
