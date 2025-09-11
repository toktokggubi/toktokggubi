package com.ssafy.toktokggubi.domain.card.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(toBuilder = true)
@Entity
@Table(name = "card_issuer")
public class CardIssuer {
    @Id
    @Column(name = "card_issuer_code", nullable = false, length = 10)
    private String cardIssuerCode;

    @Column(name = "card_issuer_name", nullable = false, length = 100)
    private String cardIssuerName;
}