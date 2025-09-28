package com.ssafy.toktokggubi.domain.notification.service;

import com.ssafy.toktokggubi.domain.notification.dto.NotificationDeleteResponseDto;
import com.ssafy.toktokggubi.domain.notification.dto.NotificationItemDto;
import com.ssafy.toktokggubi.domain.notification.dto.NotificationListResponseDto;
import com.ssafy.toktokggubi.domain.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository repo;

    /**
     * (이전: listByReadFilter) → 월 단위 조회로 이름 명확화
     */
    public NotificationListResponseDto getMonthlyNotifications(
            long userId, String ym, String readFilter, Integer limitNullable
    ) {
        String read = normalizeRead(readFilter);
        int limit = normalizeLimit(limitNullable);

        int year = Integer.parseInt(ym.substring(0, 4));
        int month = Integer.parseInt(ym.substring(4, 6));
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDateTime from = start.atStartOfDay();
        LocalDateTime toExclusive = start.plusMonths(1).atStartOfDay();

        List<Object[]> rows =
                repo.findItemsByUserReadAndPeriod(userId, read, from, toExclusive, limit);
        long total =
                repo.countByUserReadAndPeriod(userId, read, from, toExclusive);

        List<NotificationItemDto> items = rows.stream()
                .map(this::mapRowToItem)
                .toList();

        return new NotificationListResponseDto(read, limit, total, items);
    }

    /**
     * (이전: markAllUnreadInMonthAsRead) → 월 단위 unread → read
     */
    @Transactional
    public int markMonthlyUnreadAsRead(long userId, String ym) {
        Range r = parseYmToRange(ym);
        long unreadCount = repo.countByUserReadAndPeriod(userId, "unread", r.from, r.toExclusive);
        if (unreadCount == 0) return 0;

        int fetch = unreadCount > Integer.MAX_VALUE ? Integer.MAX_VALUE : (int) unreadCount;
        List<Object[]> rows = repo.findItemsByUserReadAndPeriod(userId, "unread", r.from, r.toExclusive, fetch);
        var ids = rows.stream()
                .map(o -> ((Number) o[0]).longValue()) // 0: notification_log_id
                .toList();

        return ids.isEmpty() ? 0 : repo.markAsRead(userId, ids);
    }

    /**
     * (이전: deleteAllInMonth) → 월 단위 전체 삭제
     */
    @Transactional
    public NotificationDeleteResponseDto deleteAllInMonth(long userId, String ym) {
        Range r = parseYmToRange(ym);
        int deleted = repo.deleteByUserAndPeriod(userId, r.from, r.toExclusive);
        return new NotificationDeleteResponseDto(deleted);
    }

    /* ---------- helpers ---------- */

    private NotificationItemDto mapRowToItem(Object[] r) {
        long id = ((Number) r[0]).longValue();
        String type = r[1] == null ? "" : r[1].toString();
        String title = r[2] == null ? "" : r[2].toString();
        String body = r[3] == null ? "" : r[3].toString();
        LocalDateTime sentAt = toLdt(r[4]);
        LocalDateTime readAt = toLdt(r[5]);
        return new NotificationItemDto(id, type, title, body, sentAt, readAt);
    }

    private LocalDateTime toLdt(Object col) {
        if (col == null) return null;
        if (col instanceof LocalDateTime ldt) return ldt;
        if (col instanceof Timestamp ts) return ts.toLocalDateTime();
        if (col instanceof java.util.Date d) return new Timestamp(d.getTime()).toLocalDateTime();
        return null;
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

    /**
     * ym("yyyyMM") → [from, toExclusive)
     */
    private Range parseYmToRange(String ym) {
        if (ym == null || ym.length() != 6 || !ym.chars().allMatch(Character::isDigit))
            throw new IllegalArgumentException("ym must be 'yyyyMM'");
        int year = Integer.parseInt(ym.substring(0, 4));
        int month = Integer.parseInt(ym.substring(4, 6));
        LocalDateTime from = LocalDate.of(year, month, 1).atStartOfDay();
        LocalDateTime toExclusive = from.plusMonths(1);
        return new Range(from, toExclusive);
    }

    private record Range(LocalDateTime from, LocalDateTime toExclusive) {
    }
}
