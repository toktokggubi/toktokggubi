package com.ssafy.toktokggubi.domain.budget.repository;

import com.ssafy.toktokggubi.domain.budget.entity.FixedExpense;
import com.ssafy.toktokggubi.domain.budget.entity.UserMonthlyBudget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FixedExpenseRepository extends JpaRepository<FixedExpense, Long> {

    void deleteByUserMonthlyBudget(UserMonthlyBudget umb);

    // (선택) 조회 필요 시
    List<FixedExpense> findByUserMonthlyBudget(UserMonthlyBudget umb);
}
