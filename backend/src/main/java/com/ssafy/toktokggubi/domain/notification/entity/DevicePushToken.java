package com.ssafy.toktokggubi.domain.notification.entity;

import com.ssafy.toktokggubi.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(toBuilder = true)
@Entity
@Table(
        name = "device_push_token",
        uniqueConstraints = @UniqueConstraint(name = "uq_user_token", columnNames = {"user_id", "token"})
)
public class DevicePushToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "device_push_token_id", nullable = false)
    private Long devicePushTokenId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "platform", nullable = false, length = 10)
    private DevicePlatform platform; // APNS, FCM, WEB

    @Column(name = "token", nullable = false, length = 300)
    private String token;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = Boolean.TRUE;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}