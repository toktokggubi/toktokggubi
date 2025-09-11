package com.ssafy.toktokggubi.domain.merchant.entity;

import com.ssafy.toktokggubi.domain.category.entity.Category;
import com.ssafy.toktokggubi.domain.franchise.entity.Franchise;
import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(toBuilder = true)
@Entity
@Table(
        name = "merchant",
        indexes = {
                @Index(name = "idx_mrch_name", columnList = "merchant_name"),
                @Index(name = "idx_mrch_category", columnList = "category_id"),
                @Index(name = "idx_mrch_franchise", columnList = "franchise_id")
        }
)
public class Merchant {
    @Id
    @Column(name = "merchant_id", nullable = false)
    private Long merchantId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "franchise_id")
    private Franchise franchise; // nullable, ON DELETE SET NULL

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(name = "merchant_name", nullable = false, length = 150)
    private String merchantName;
}