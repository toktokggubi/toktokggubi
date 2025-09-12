// src/main/java/com/ssafy/toktokggubi/domain/notification/repository/NotificationRepository.java
package com.ssafy.toktokggubi.domain.notification.repository;

import com.ssafy.toktokggubi.domain.notification.dto.NotificationItem;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Repository
public class NotificationRepository {

    @PersistenceContext
    private EntityManager em;

    /* =========================
       (신규) 월 범위 + 읽음 필터 조회
       ========================= */
    public List<NotificationItem> findByUserReadAndPeriod(
            long userId,
            String read,                  // "unread" | "read" | "all"
            LocalDateTime fromInclusive,  // sent_at >= fromInclusive
            LocalDateTime toExclusive,    // sent_at <  toExclusive
            int limit
    ) {
        StringBuilder sql = new StringBuilder("""
            SELECT notification_log_id, type, title, body, sent_at, read_at
            FROM notification_log
            WHERE user_id = ?1
              AND sent_at >= ?2
              AND sent_at <  ?3
        """);

        switch (read == null ? "unread" : read.toLowerCase()) {
            case "unread" -> sql.append(" AND read_at IS NULL ");
            case "read"   -> sql.append(" AND read_at IS NOT NULL ");
            case "all"    -> { /* no condition */ }
            default       -> sql.append(" AND read_at IS NULL ");
        }

        sql.append(" ORDER BY sent_at DESC LIMIT ?4");

        @SuppressWarnings("unchecked")
        List<Object[]> rows = em.createNativeQuery(sql.toString())
                .setParameter(1, userId)
                .setParameter(2, toTs(fromInclusive))
                .setParameter(3, toTs(toExclusive))
                .setParameter(4, limit)
                .getResultList();

        List<NotificationItem> list = new ArrayList<>(rows.size());
        for (Object[] r : rows) {
            long id = ((Number) r[0]).longValue();
            String type = r[1] == null ? "" : r[1].toString();
            String title = r[2] == null ? "" : r[2].toString();
            String body = r[3] == null ? "" : r[3].toString();
            LocalDateTime sentAt = toLdt(r[4]);
            LocalDateTime readAt = toLdt(r[5]);
            list.add(new NotificationItem(id, type, title, body, sentAt, readAt));
        }
        return list;
    }

    public long countByUserReadAndPeriod(
            long userId,
            String read,
            LocalDateTime fromInclusive,
            LocalDateTime toExclusive
    ) {
        StringBuilder sql = new StringBuilder("""
            SELECT COUNT(*)
            FROM notification_log
            WHERE user_id = ?1
              AND sent_at >= ?2
              AND sent_at <  ?3
        """);

        switch (read == null ? "unread" : read.toLowerCase()) {
            case "unread" -> sql.append(" AND read_at IS NULL ");
            case "read"   -> sql.append(" AND read_at IS NOT NULL ");
            case "all"    -> { /* no condition */ }
            default       -> sql.append(" AND read_at IS NULL ");
        }

        Number n = (Number) em.createNativeQuery(sql.toString())
                .setParameter(1, userId)
                .setParameter(2, toTs(fromInclusive))
                .setParameter(3, toTs(toExclusive))
                .getSingleResult();
        return n.longValue();
    }

    /* =========================
       (기존) 기간 제한 없는 버전 (호환 유지용)
       ========================= */
    public List<NotificationItem> findByUserAndReadFilter(long userId, String read, int limit) {
        StringBuilder sql = new StringBuilder("""
            SELECT notification_log_id, type, title, body, sent_at, read_at
            FROM notification_log
            WHERE user_id = ?1
        """);

        switch (read == null ? "unread" : read.toLowerCase()) {
            case "unread" -> sql.append(" AND read_at IS NULL ");
            case "read"   -> sql.append(" AND read_at IS NOT NULL ");
            case "all"    -> { /* no condition */ }
            default       -> sql.append(" AND read_at IS NULL ");
        }

        sql.append(" ORDER BY sent_at DESC LIMIT ?2");

        @SuppressWarnings("unchecked")
        List<Object[]> rows = em.createNativeQuery(sql.toString())
                .setParameter(1, userId)
                .setParameter(2, limit)
                .getResultList();

        List<NotificationItem> list = new ArrayList<>(rows.size());
        for (Object[] r : rows) {
            long id = ((Number) r[0]).longValue();
            String type = r[1] == null ? "" : r[1].toString();
            String title = r[2] == null ? "" : r[2].toString();
            String body = r[3] == null ? "" : r[3].toString();
            LocalDateTime sentAt = toLdt(r[4]);
            LocalDateTime readAt = toLdt(r[5]);
            list.add(new NotificationItem(id, type, title, body, sentAt, readAt));
        }
        return list;
    }

    public long countByUserAndReadFilter(long userId, String read) {
        StringBuilder sql = new StringBuilder("""
            SELECT COUNT(*)
            FROM notification_log
            WHERE user_id = ?1
        """);

        switch (read == null ? "unread" : read.toLowerCase()) {
            case "unread" -> sql.append(" AND read_at IS NULL ");
            case "read"   -> sql.append(" AND read_at IS NOT NULL ");
            case "all"    -> { /* no condition */ }
            default       -> sql.append(" AND read_at IS NULL ");
        }

        Number n = (Number) em.createNativeQuery(sql.toString())
                .setParameter(1, userId)
                .getSingleResult();
        return n.longValue();
    }

    /* =========================
       변환 유틸
       ========================= */
    private Timestamp toTs(LocalDateTime ldt) {
        return ldt == null ? null : Timestamp.valueOf(ldt);
    }

    private LocalDateTime toLdt(Object col) {
        if (col == null) return null;
        if (col instanceof Timestamp ts) return ts.toLocalDateTime();
        if (col instanceof java.util.Date d) return new Timestamp(d.getTime()).toLocalDateTime();
        return null;
    }
}
