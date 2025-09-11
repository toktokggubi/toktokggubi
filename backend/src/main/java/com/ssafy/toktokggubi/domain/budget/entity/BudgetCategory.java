package com.ssafy.toktokggubi.domain.budget.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(toBuilder = true)
@Entity
@Table(
        name = "budget_category",
        uniqueConstraints = @UniqueConstraint(name = "uq_budget_category", columnNames = {"user_monthly_budget_id", "user_selected_category_id"})
)
public class BudgetCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "budget_category_id", nullable = false)
    private Long budgetCategoryId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_monthly_budget_id", nullable = false)
    private UserMonthlyBudget userMonthlyBudget;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_selected_category_id", nullable = false)
    private UserSelectedCategory userSelectedCategory;

    @Column(name = "final_amount")
    private Long finalAmount;
}