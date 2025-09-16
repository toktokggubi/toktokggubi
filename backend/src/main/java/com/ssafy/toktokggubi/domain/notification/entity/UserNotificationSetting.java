package com.ssafy.toktokggubi.domain.notification.entity;

import com.ssafy.toktokggubi.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(toBuilder = true)
@Entity
@Table(
        name = "user_notification_setting",
        uniqueConstraints = @UniqueConstraint(name = "uq_uns_user", columnNames = {"user_id"})
)
public class UserNotificationSetting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_notification_setting_id", nullable = false)
    private Long userNotificationSettingId;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "all_notifications_on", nullable = false)
    private Boolean allNotificationsOn = Boolean.TRUE;

    @Column(name = "budget_threshold_on", nullable = false)
    private Boolean budgetThresholdOn = Boolean.TRUE;

    @Column(name = "anomaly_detection_on", nullable = false)
    private Boolean anomalyDetectionOn = Boolean.TRUE;

    @Column(name = "location_based_on", nullable = false)
    private Boolean locationBasedOn = Boolean.TRUE;

    @Column(name = "monthly_report_on", nullable = false)
    private Boolean monthlyReportOn = Boolean.TRUE;

    @Column(name = "shake_trigger_on", nullable = false)
    private Boolean shakeTriggerOn = Boolean.TRUE;
}