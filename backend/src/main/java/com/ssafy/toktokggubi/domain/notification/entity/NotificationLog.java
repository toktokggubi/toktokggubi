package com.ssafy.toktokggubi.domain.notification.entity;

import com.ssafy.toktokggubi.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(toBuilder = true)
@Entity
@Table(
        name = "notification_log",
        indexes = @Index(name = "idx_notif_user_time", columnList = "user_id, sent_at")
)
public class NotificationLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_log_id", nullable = false)
    private Long notificationLogId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "type", nullable = false, length = 50)
    private String type;

    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Column(name = "body", nullable = false, length = 1000)
    private String body;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "payload_json")
    private Map<String, Object> payloadJson;

    @Column(name = "sent_at", nullable = false)
    private LocalDateTime sentAt;

    @Column(name = "read_at")
    private LocalDateTime readAt;
}