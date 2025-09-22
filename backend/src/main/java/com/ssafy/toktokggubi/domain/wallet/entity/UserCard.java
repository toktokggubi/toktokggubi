package com.ssafy.toktokggubi.domain.wallet.entity;

import com.ssafy.toktokggubi.domain.card.entity.CardProduct;
import com.ssafy.toktokggubi.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(toBuilder = true)
@Entity
@Table(
        name = "user_card",
        uniqueConstraints = @UniqueConstraint(name = "uq_user_card_unique", columnNames = {"user_id", "card_unique_no"})
)
public class UserCard {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_card_id", nullable = false)
    private Long userCardId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_account_id", nullable = false)
    private UserAccount userAccount;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "card_unique_no", nullable = false)
    private CardProduct cardProduct;

    @Column(name = "card_no", nullable = false, length = 32)
    private String cardNo;

    @Column(name = "cvc", nullable = false, length = 10)
    private String cvc;

    @Column(name = "withdrawal_date")
    private Byte withdrawalDate; // 1~7 (Mon~Sun)

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = Boolean.TRUE;
}