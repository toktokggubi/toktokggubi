package com.ssafy.toktokggubi.domain.notification.dto;

import java.util.List;

public record NotificationListResponse(
        String readFilter, // "unread" | "read" | "all"
        int limit,
        long total,
        List<NotificationItem> items
) {}
