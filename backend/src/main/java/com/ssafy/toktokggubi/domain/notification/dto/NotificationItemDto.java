package com.ssafy.toktokggubi.domain.notification.dto;

import java.time.LocalDateTime;

public record NotificationItemDto(
        long notificationId,
        String type,
        String title,
        String body,
        LocalDateTime sentAt,
        LocalDateTime readAt
) {
}