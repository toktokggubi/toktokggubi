package com.ssafy.toktokggubi.domain.molbbang.entity;

import com.ssafy.toktokggubi.domain.user.entity.User;
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
        name = "molbbang_room",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_mr_code", columnNames = {"room_code"})
        },
        indexes = {
                @Index(name = "idx_mr_status", columnList = "status")
        }
)
public class MolbbangRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_id", nullable = false)
    private Long roomId;

    @Column(name = "room_code", nullable = false, length = 12)
    private String roomCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "host_user_id", nullable = false, foreignKey = @ForeignKey(name = "FK_mr_host_user"))
    private User hostUser;

    @Column(name = "amount", nullable = false)
    private Long amount;

    @Column(name = "total_rounds", nullable = false)
    private Integer totalRounds;

    @Column(name = "current_round_no")
    private Integer currentRoundNo;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private RoomStatus status;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    // 연관관계 (양방향 선택)
    @Builder.Default
    @OneToMany(mappedBy = "room", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = false)
    private List<MolbbangMember> members = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "room", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = false)
    private List<MolbbangRound> rounds = new ArrayList<>();
}
