package com.ssafy.toktokggubi.domain.notification.repository;


import com.ssafy.toktokggubi.domain.notification.entity.NotificationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

public interface NotificationRepository extends JpaRepository<NotificationLog, Long> {

    // ✅ 중복 체크 (user_id + type + budget_ym + category_id)
    @Query(value = """
        SELECT CASE WHEN EXISTS (
            SELECT 1
              FROM notification_log
             WHERE user_id   = :userId
               AND type      = :type
               AND budget_ym = :budgetYm
               AND category_id = :categoryId
        ) THEN TRUE ELSE FALSE END
        """, nativeQuery = true)
    boolean existsComposite(
            @Param("userId") long userId,
            @Param("type") String type,
            @Param("budgetYm") String budgetYm,
            @Param("categoryId") String categoryId
    );


    // 조회 (월 범위 + 읽음필터), 결과는 Object[]로 받고 서비스에서 매핑
    @Query(value = """
        SELECT notification_log_id, type, title, body, sent_at, read_at
          FROM notification_log
         WHERE user_id = :userId
           AND sent_at >= :from
           AND sent_at <  :to
           AND (
                :read = 'all'
             OR (:read = 'unread' AND read_at IS NULL)
             OR (:read = 'read'   AND read_at IS NOT NULL)
           )
         ORDER BY sent_at DESC
         LIMIT :limit
    """, nativeQuery = true)
    List<Object[]> findItemsByUserReadAndPeriod(
            @Param("userId") long userId,
            @Param("read") String read,
            @Param("from") LocalDateTime fromInclusive,
            @Param("to") LocalDateTime toExclusive,
            @Param("limit") int limit
    );

    @Query(value = """
        SELECT COUNT(*)
          FROM notification_log
         WHERE user_id = :userId
           AND sent_at >= :from
           AND sent_at <  :to
           AND (
                :read = 'all'
             OR (:read = 'unread' AND read_at IS NULL)
             OR (:read = 'read'   AND read_at IS NOT NULL)
           )
    """, nativeQuery = true)
    long countByUserReadAndPeriod(
            @Param("userId") long userId,
            @Param("read") String read,
            @Param("from") LocalDateTime fromInclusive,
            @Param("to") LocalDateTime toExclusive
    );

    // 읽음 처리 (선택 ID들)
    @Modifying
    @Query(value = """
        UPDATE notification_log
           SET read_at = NOW()
         WHERE user_id = :userId
           AND read_at IS NULL
           AND notification_log_id IN (:ids)
    """, nativeQuery = true)
    int markAsRead(
            @Param("userId") long userId,
            @Param("ids") List<Long> ids
    );

    // 월 범위 전체 삭제
    @Modifying
    @Query(value = """
        DELETE FROM notification_log
         WHERE user_id = :userId
           AND sent_at >= :from
           AND sent_at <  :to
    """, nativeQuery = true)
    int deleteByUserAndPeriod(
            @Param("userId") long userId,
            @Param("from") LocalDateTime fromInclusive,
            @Param("to") LocalDateTime toExclusive
    );
    @Query(value = """
        SELECT CASE WHEN EXISTS (
            SELECT 1
              FROM notification_log
             WHERE user_id = :userId
               AND type    = :type
               AND sent_at >= :fromInclusive
               AND sent_at <  :toExclusive
        ) THEN TRUE ELSE FALSE END
        """, nativeQuery = true)
    boolean existsByUserTypeInMonth(
            @Param("userId") long userId,
            @Param("type") String type,
            @Param("fromInclusive") java.time.LocalDateTime fromInclusive,
            @Param("toExclusive")  java.time.LocalDateTime toExclusive
    );

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @Query(value = """
    INSERT INTO notification_log
        (user_id, type, title, body, payload_json, sent_at)
    VALUES
        (:userId, :type, :title, :body, :payloadJson, :sendAt)
    """, nativeQuery = true)
    int insertLog(
            @Param("userId") long userId,
            @Param("type") String type,
            @Param("title") String title,
            @Param("body") String body,
            @Param("payloadJson") String payloadJson,
            @Param("sentAt") LocalDateTime sentAt
    );
    @Query(value = """
    SELECT COUNT(*)
      FROM notification_log
     WHERE user_id = :userId
       AND type    = :type
       AND sent_at >= :from
       AND sent_at <  :to
    """, nativeQuery = true)
    long countByUserTypeAndPeriod(
            @Param("userId") long userId,
            @Param("type") String type,
            @Param("from") java.time.LocalDateTime fromInclusive,
            @Param("to")   java.time.LocalDateTime toExclusive
    );
}

