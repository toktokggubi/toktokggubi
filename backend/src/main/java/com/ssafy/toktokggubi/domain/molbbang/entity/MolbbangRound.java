package com.ssafy.toktokggubi.domain.molbbang.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(toBuilder = true)
@Entity
@Table(
        name = "molbbang_round",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_mrd_room_no", columnNames = {"room_id", "round_no"})
        },
        indexes = {
                @Index(name = "idx_mrd_room", columnList = "room_id"),
                @Index(name = "idx_mrd_status", columnList = "status")
        }
)
public class MolbbangRound {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "round_id", nullable = false)
    private Long roundId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false, foreignKey = @ForeignKey(name = "FK_mrd_room"))
    private MolbbangRoom room;

    @Column(name = "round_no", nullable = false)
    private Integer roundNo;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private RoundStatus status;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    // 편의: 라운드 생성 시각(DDL엔 없지만, 필요 없다면 제거 가능)
    @CreationTimestamp
    @Column(name = "created_at", insertable = true, updatable = false)
    private LocalDateTime createdAt;

    // 연관관계
    @Builder.Default
    @OneToMany(mappedBy = "round", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = false)
    private List<MolbbangScore> scores = new ArrayList<>();
}
