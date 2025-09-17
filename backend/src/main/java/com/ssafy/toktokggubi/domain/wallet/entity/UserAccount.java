package com.ssafy.toktokggubi.domain.wallet.entity;

import com.ssafy.toktokggubi.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(toBuilder = true)
@Entity
@Table(
        name = "user_account",
        uniqueConstraints = @UniqueConstraint(name = "uq_user_account", columnNames = {"user_id", "account_no"})
)
public class UserAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_account_id", nullable = false)
    private Long userAccountId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "account_no", nullable = false, length = 32)
    private String accountNo;

    @Column(name = "account_name", length = 150)
    private String accountName;

    @Column(name = "account_description", length = 500)
    private String accountDescription;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = Boolean.TRUE;
}