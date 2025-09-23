package com.ssafy.toktokggubi.domain.budget.repository;

import com.ssafy.toktokggubi.domain.budget.entity.UserMonthlyBudget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserMonthlyBudgetRepository extends JpaRepository<UserMonthlyBudget, Long> {
    Optional<UserMonthlyBudget> findByUser_UserIdAndBudgetYmAndIsActiveTrue(Long userId, String budgetYm);

    // user.userId + budgetYm 조합 존재 여부 (중복 커밋 방지 체크)
    boolean existsByUser_UserIdAndBudgetYm(Long userId, String budgetYm);

    // (선택) 필요 시 조회 버전도
    Optional<UserMonthlyBudget> findByUser_UserIdAndBudgetYm(Long userId, String budgetYm);

    @Query("""
    SELECT u.totalAmount
      FROM UserMonthlyBudget u
     WHERE u.user.userId = :userId
       AND u.budgetYm = :budgetYm
""")
    Long findFinalTotalAmount(
            @Param("userId") Long userId,
            @Param("budgetYm") String budgetYm
    );
}
