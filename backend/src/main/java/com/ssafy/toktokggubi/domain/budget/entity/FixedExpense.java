package com.ssafy.toktokggubi.domain.budget.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(toBuilder = true)
@Entity
@Table(
        name = "fixed_expense",
        indexes = @Index(name = "idx_fe_budget", columnList = "user_monthly_budget_id")
)
public class FixedExpense {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "fixed_expense_id", nullable = false)
    private Long fixedExpenseId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_monthly_budget_id", nullable = false)
    private UserMonthlyBudget userMonthlyBudget;

    @Column(name = "title", nullable = false, length = 100)
    private String title;

    @Column(name = "amount", nullable = false)
    private Long amount;

    @Column(name = "include_in_budget", nullable = false)
    private Boolean includeInBudget = Boolean.TRUE;

    @Column(name = "payment_day")
    private Byte paymentDay; // 1~31
}