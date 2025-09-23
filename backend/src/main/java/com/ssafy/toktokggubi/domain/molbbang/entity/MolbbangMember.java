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
        name = "molbbang_member",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_mm_room_user", columnNames = {"room_id", "user_id"}),
                @UniqueConstraint(name = "uq_mm_room_nickname", columnNames = {"room_id", "nickname"})
        },
        indexes = {
                @Index(name = "idx_mm_room", columnList = "room_id"),
                @Index(name = "idx_mm_user", columnList = "user_id")
        }
)
public class MolbbangMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "member_id", nullable = false)
    private Long memberId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false, foreignKey = @ForeignKey(name = "FK_mm_room"))
    private MolbbangRoom room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "FK_mm_user"))
    private User user;

    @Column(name = "nickname", nullable = false, length = 50)
    private String nickname;

    @Column(name = "is_host", nullable = false)
    private boolean isHost;

    @Column(name = "is_ready", nullable = false)
    private boolean isReady;

    @Column(name = "is_active", nullable = false)
    private boolean isActive;

    @CreationTimestamp
    @Column(name = "joined_at", nullable = false)
    private LocalDateTime joinedAt;

    @Column(name = "left_at")
    private LocalDateTime leftAt;

    // 연관관계
    @Builder.Default
    @OneToMany(mappedBy = "member", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = false)
    private List<MolbbangScore> scores = new ArrayList<>();
}
