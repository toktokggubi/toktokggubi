package com.ssafy.toktokggubi.domain.notification.dto;

import java.util.List;

public record NotificationListResponseDto(
        String readFilter, // "unread" | "read" | "all"
        int limit,
        long total,
        List<NotificationItemDto> items
) {}
