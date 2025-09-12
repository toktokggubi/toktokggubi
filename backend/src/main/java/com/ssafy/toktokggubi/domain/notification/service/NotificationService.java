// src/main/java/com/ssafy/toktokggubi/domain/notification/service/NotificationService.java
package com.ssafy.toktokggubi.domain.notification.service;

import com.ssafy.toktokggubi.domain.notification.dto.NotificationItem;
import com.ssafy.toktokggubi.domain.notification.dto.NotificationListResponse;
import com.ssafy.toktokggubi.domain.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository repo;

    //  기존 메서드 유지가 필요하면 남겨두고, 아래 오버로드를 새로 사용
    public NotificationListResponse listByReadFilter(long userId, String read, Integer limitNullable) {
        // 필요 시 과거 호출 호환용 (전체 기간 등) — 현재는 사용 안 하면 삭제해도 OK
        String normalized = normalizeRead(read);
        int limit = normalizeLimit(limitNullable);
        // 전체기간 버전이 필요없다면 구현 비워두거나 바로 throw 해도 됨
        return new NotificationListResponse(normalized, limit, 0L, List.of());
    }

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
}
