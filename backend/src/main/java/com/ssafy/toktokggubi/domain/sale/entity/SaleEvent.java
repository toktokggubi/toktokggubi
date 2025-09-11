package com.ssafy.toktokggubi.domain.sale.entity;

import com.ssafy.toktokggubi.domain.franchise.entity.Franchise;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(toBuilder = true)
@Entity
@Table(
        name = "sale_event",
        indexes = {
                @Index(name = "idx_sale_period", columnList = "starts_at, ends_at"),
                @Index(name = "idx_sale_franchise", columnList = "franchise_id")
        }
)
public class SaleEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sale_event_id", nullable = false)
    private Long saleEventId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "franchise_id", nullable = false)
    private Franchise franchise;

    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Column(name = "starts_at", nullable = false)
    private LocalDateTime startsAt;

    @Column(name = "ends_at", nullable = false)
    private LocalDateTime endsAt;

    @Column(name = "description", length = 1000)
    private String description;
}