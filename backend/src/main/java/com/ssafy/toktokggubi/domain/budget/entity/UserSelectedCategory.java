package com.ssafy.toktokggubi.domain.budget.entity;

import com.ssafy.toktokggubi.domain.category.entity.Category;
import com.ssafy.toktokggubi.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(toBuilder = true)
@Entity
@Table(
        name = "user_selected_category",
        uniqueConstraints = @UniqueConstraint(name = "uq_usc_user_cat", columnNames = {"user_id", "category_id"})
)
public class UserSelectedCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_selected_category_id", nullable = false)
    private Long userSelectedCategoryId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;
}