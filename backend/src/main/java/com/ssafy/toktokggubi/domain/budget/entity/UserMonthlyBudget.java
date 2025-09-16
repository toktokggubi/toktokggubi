package com.ssafy.toktokggubi.domain.budget.entity;

import com.ssafy.toktokggubi.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(toBuilder = true)
@Entity
@Table(
        name = "user_monthly_budget",
        uniqueConstraints = @UniqueConstraint(name = "uq_umb_user_month", columnNames = {"user_id", "budget_ym"})
)
public class UserMonthlyBudget {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_monthly_budget_id", nullable = false)
    private Long userMonthlyBudgetId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "budget_ym", nullable = false, length = 6)
    private String budgetYm; // YYYYMM

    @Column(name = "total_amount", nullable = false)
    private Long totalAmount;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = Boolean.TRUE;
}