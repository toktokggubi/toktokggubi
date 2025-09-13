// src/main/java/com/ssafy/toktokggubi/domain/notification/service/NotificationService.java
package com.ssafy.toktokggubi.domain.notification.service;

import com.ssafy.toktokggubi.domain.notification.dto.NotificationItem;
import com.ssafy.toktokggubi.domain.notification.dto.NotificationListResponse;
import com.ssafy.toktokggubi.domain.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository repo;

    //  기존 메서드 유지가 필요하면 남겨두고, 아래 오버로드를 새로 사용
    /** 컨트롤러에서 받은 ym(yyyyMM) 기준으로 해당 월만 조회 */
    public NotificationListResponse listByReadFilter(long userId, String read, Integer limitNullable, String ym) {
        String normalized = normalizeRead(read);
        int limit = normalizeLimit(limitNullable);

        // ym -> [from, toExclusive) 경계 계산 (YearMonth 안 쓰고 안전 파싱)
        int year = Integer.parseInt(ym.substring(0, 4));
        int month = Integer.parseInt(ym.substring(4, 6));
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDateTime from = start.atStartOfDay();                 // inclusive
        LocalDateTime toExclusive = start.plusMonths(1).atStartOfDay(); // exclusive

        List<NotificationItem> items =
                repo.findByUserReadAndPeriod(userId, normalized, from, toExclusive, limit);
        long total =
                repo.countByUserReadAndPeriod(userId, normalized, from, toExclusive);

        return new NotificationListResponse(normalized, limit, total, items);
    }


    @Transactional
    public int markAllUnreadInMonthAsRead(long userId, String ym) {
        Range r = parseYmToRange(ym);
        long unreadCount = repo.countByUserReadAndPeriod(userId, "unread", r.from, r.toExclusive);
        if (unreadCount == 0) return 0;

        int fetch = (unreadCount > Integer.MAX_VALUE) ? Integer.MAX_VALUE : (int) unreadCount;
        List<NotificationItem> unread =
                repo.findByUserReadAndPeriod(userId, "unread", r.from, r.toExclusive, fetch);

        var ids = unread.stream().map(NotificationItem::notificationId).toList();
        return repo.markAsRead(userId, ids);
    }


    private String normalizeRead(String read) {
        if (read == null) return "unread";
        String r = read.toLowerCase();
        return switch (r) {
            case "unread", "read", "all" -> r;
            default -> "unread";
        };
    }

    private int normalizeLimit(Integer limit) {
        if (limit == null) return 20;
        return Math.max(1, Math.min(limit, 100));
    }

    /** ym("yyyyMM") → [from, toExclusive) */
    private Range parseYmToRange(String ym) {
        if (ym == null || ym.length() != 6 || !ym.chars().allMatch(Character::isDigit))
            throw new IllegalArgumentException("ym must be 'yyyyMM' (e.g. 202509)");
        int year = Integer.parseInt(ym.substring(0, 4));
        int month = Integer.parseInt(ym.substring(4, 6));
        if (month < 1 || month > 12) throw new IllegalArgumentException("month must be 01..12");

        LocalDateTime from = LocalDate.of(year, month, 1).atStartOfDay();
        LocalDateTime toExclusive = from.plusMonths(1);
        return new Range(from, toExclusive);
    }

    private record Range(LocalDateTime from, LocalDateTime toExclusive) {}
}
