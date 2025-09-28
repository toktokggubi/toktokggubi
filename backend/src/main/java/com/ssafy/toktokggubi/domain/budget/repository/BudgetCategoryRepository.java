package com.ssafy.toktokggubi.domain.budget.repository;

import com.ssafy.toktokggubi.domain.budget.entity.BudgetCategory;
import com.ssafy.toktokggubi.domain.budget.entity.UserMonthlyBudget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BudgetCategoryRepository extends JpaRepository<BudgetCategory, Long> {

    // 해당 유저/월(활성) 예산 카테고리: (categoryId, finalAmount)
    @Query("""
                select bc.userSelectedCategory.category.categoryId, bc.finalAmount
                from BudgetCategory bc
                where bc.userMonthlyBudget.user.userId = :userId
                  and bc.userMonthlyBudget.budgetYm    = :ym
                  and bc.userMonthlyBudget.isActive    = true
            """)
    List<Object[]> findCatIdAndAmountForUserYm(Long userId, String ym);

    // ✅ 엔티티 연관만 사용하는 JPQL
    @Query("""
                SELECT COALESCE(bc.finalAmount, 0)
                  FROM BudgetCategory bc
                  JOIN bc.userMonthlyBudget umb
                  JOIN bc.userSelectedCategory usc
                  JOIN usc.category c
                 WHERE umb.user.userId = :userId
                   AND umb.budgetYm = :budgetYm
                   AND c.categoryId = :categoryId
            """)
    Long findFinalAmountByUserYmAndCategory(
            @Param("userId") long userId,
            @Param("budgetYm") String budgetYm,    // "YYYYMM"
            @Param("categoryId") long categoryId
    );

    void deleteByUserMonthlyBudget(UserMonthlyBudget umb);

    // (선택) 조회 필요 시
    List<BudgetCategory> findByUserMonthlyBudget(UserMonthlyBudget umb);
}
