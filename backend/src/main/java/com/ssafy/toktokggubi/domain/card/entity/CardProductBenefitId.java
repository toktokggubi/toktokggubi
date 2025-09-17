package com.ssafy.toktokggubi.domain.card.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serial;
import java.io.Serializable;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@Embeddable
public class CardProductBenefitId implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @Column(name = "franchise_id", nullable = false)
    private Long franchiseId;

    @Column(name = "card_unique_no", nullable = false, length = 40)
    private String cardUniqueNo;
}
