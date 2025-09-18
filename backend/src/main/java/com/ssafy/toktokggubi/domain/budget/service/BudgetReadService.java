package com.ssafy.toktokggubi.domain.budget.service;


import com.ssafy.toktokggubi.domain.budget.dto.*;

import com.ssafy.toktokggubi.domain.budget.repository.UserMonthlyBudgetRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
public class BudgetReadService {

    private final UserMonthlyBudgetRepository umbRepo;

    @Transactional(readOnly = true)
    public TotalAmountResponseDto getTotalAmount(Long userId, String budgetYm) {
        var umb = umbRepo.findByUser_UserIdAndBudgetYm(userId, budgetYm)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "userId=" + userId + ", budgetYm=" + budgetYm + " not found"));

        return new TotalAmountResponseDto(umb.getTotalAmount());
    }
}
