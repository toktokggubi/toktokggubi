package com.ssafy.toktokggubi.domain.user.entity;

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
        name = "user",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_user_email", columnNames = {"email"}),
                @UniqueConstraint(name = "uq_user_kakao", columnNames = {"kakao_sub"})
        }
)
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "email", nullable = false, length = 255)
    private String email;

    @Column(name = "password", length = 255)
    private String password;

    @Column(name = "nickname", nullable = false, length = 50)
    private String nickname;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", nullable = false, length = 50)
    private Gender gender; // M, F

    @Column(name = "age_group", length = 20)
    private String ageGroup;

    @Column(name = "job_title", length = 50)
    private String jobTitle;

    @Column(name = "monthly_income")
    private Long monthlyIncome;

    @Column(name = "kakao_sub", length = 128)
    private String kakaoSub;

    @Column(name = "finance_user_key", length = 36)
    private String financeUserKey;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50)
    private UserStatus status; // ACTIVE, INACTIVE, WITHDRAWN
}