package com.ssafy.toktokggubi.domain.card.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(toBuilder = true)
@Entity
@Table(
        name = "card_product",
        indexes = {
                @Index(name = "idx_cp_issuer", columnList = "card_issuer_code")
        }
)
public class CardProduct {
    @Id
    @Column(name = "card_unique_no", nullable = false, length = 40)
    private String cardUniqueNo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "card_issuer_code", nullable = false)
    private CardIssuer cardIssuer;

    @Column(name = "card_name", nullable = false, length = 150)
    private String cardName;

    @Enumerated(EnumType.STRING)
    @Column(name = "card_type_name", nullable = false, length = 50)
    private CardTypeName cardTypeName; // CREDIT, CHECK


    @Column(name = "image_url", length = 255)
    private String imageUrl;


    @Column(name = "card_description", length = 500)
    private String cardDescription;
}