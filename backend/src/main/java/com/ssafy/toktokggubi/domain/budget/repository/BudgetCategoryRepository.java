package com.ssafy.toktokggubi.domain.budget.repository;

import com.ssafy.toktokggubi.domain.budget.entity.BudgetCategory;
import com.ssafy.toktokggubi.domain.budget.entity.UserMonthlyBudget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BudgetCategoryRepository extends JpaRepository<BudgetCategory, Long> {

    void deleteByUserMonthlyBudget(UserMonthlyBudget umb);

    // (선택) 조회 필요 시
    List<BudgetCategory> findByUserMonthlyBudget(UserMonthlyBudget umb);
}
