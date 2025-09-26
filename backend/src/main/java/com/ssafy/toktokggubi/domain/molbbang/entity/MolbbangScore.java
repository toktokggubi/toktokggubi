package com.ssafy.toktokggubi.domain.molbbang.entity;

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
        name = "molbbang_score",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_ms_round_member", columnNames = {"round_id", "member_id"})
        },
        indexes = {
                @Index(name = "idx_ms_round", columnList = "round_id"),
                @Index(name = "idx_ms_member", columnList = "member_id")
        }
)
public class MolbbangScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "score_id", nullable = false)
    private Long scoreId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "round_id", nullable = false, foreignKey = @ForeignKey(name = "FK_ms_round"))
    private MolbbangRound round;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false, foreignKey = @ForeignKey(name = "FK_ms_member"))
    private MolbbangMember member;

    @Column(name = "score", nullable = false)
    private Integer score;

    @CreationTimestamp
    @Column(name = "submitted_at", nullable = false)
    private LocalDateTime submittedAt;
}
