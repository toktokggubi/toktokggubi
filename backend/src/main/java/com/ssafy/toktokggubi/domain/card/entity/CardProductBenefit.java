package com.ssafy.toktokggubi.domain.card.entity;

import com.ssafy.toktokggubi.domain.franchise.entity.Franchise;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(toBuilder = true)
@Entity
@Table(
        name = "card_product_benefit",
        indexes = @Index(name = "idx_cpb_franchise", columnList = "franchise_id")
)
public class CardProductBenefit {

    @EmbeddedId
    @AttributeOverrides({
            @AttributeOverride(name = "franchiseId",
                    column = @Column(name = "franchise_id", nullable = false)),
            @AttributeOverride(name = "cardUniqueNo",
                    column = @Column(name = "card_unique_no", nullable = false, length = 40))
    })
    private CardProductBenefitId id;

    @MapsId("franchiseId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "franchise_id", nullable = false)
    private Franchise franchise;

    @MapsId("cardUniqueNo")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "card_unique_no",
            nullable = false,
            referencedColumnName = "card_unique_no",
            columnDefinition = "varchar(40)"
    )
    private CardProduct cardProduct;

    @Column(name = "discount_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal discountRate;
}
