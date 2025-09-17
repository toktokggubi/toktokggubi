package com.ssafy.toktokggubi.domain.transaction.entity;

import com.ssafy.toktokggubi.domain.merchant.entity.Merchant;
import com.ssafy.toktokggubi.domain.user.entity.User;
import com.ssafy.toktokggubi.domain.wallet.entity.UserCard;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(toBuilder = true)
@Entity
@Table(
        name = "card_transaction",
        indexes = {
                @Index(name = "idx_ct_user_ymd", columnList = "user_id, transaction_ymd"),
                @Index(name = "idx_ct_merchant", columnList = "merchant_id")
        }
)
public class CardTransaction {
    @Id
    @Column(name = "transaction_unique_no", nullable = false, length = 40)
    private String transactionUniqueNo;


    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;


    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_card_id", nullable = false)
    private UserCard userCard;


    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "merchant_id", nullable = false)
    private Merchant merchant;


    @Enumerated(EnumType.STRING)
    @Column(name = "card_status", nullable = false, length = 20)
    private CardStatus cardStatus = CardStatus.APPROVED;


    @Column(name = "transaction_ymd", nullable = false, columnDefinition = "char(8)")
    private String transactionYmd; // YYYYMMDD


    @Column(name = "transaction_hms", nullable = false, columnDefinition = "char(6)")
    private String transactionHms; // HHMMSS


    @Column(name = "payment_balance", nullable = false)
    private Long paymentBalance;


    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}