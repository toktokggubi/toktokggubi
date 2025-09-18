package com.ssafy.toktokggubi.domain.budget.service;


import com.ssafy.toktokggubi.domain.budget.dto.*;

import com.ssafy.toktokggubi.domain.budget.entity.UserMonthlyBudget;
import com.ssafy.toktokggubi.domain.budget.repository.FixedExpenseRepository;
import com.ssafy.toktokggubi.domain.budget.repository.UserMonthlyBudgetRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Service
@RequiredArgsConstructor
public class BudgetReadService {

    private final UserMonthlyBudgetRepository umbRepo;
private final FixedExpenseRepository fixedExpenseRepository;
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
}
