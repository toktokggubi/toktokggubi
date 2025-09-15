package com.ssafy.toktokggubi.domain.transaction.repository;

import com.ssafy.toktokggubi.domain.transaction.entity.CardTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TransactionCategoryRepository extends JpaRepository<CardTransaction, String> {

    /* 특정 월(yyyyMM) 카테고리별 합계/건수 — 요약 */
    @Query(value = """
        SELECT
            c.category_id AS categoryId,
            c.name        AS categoryName,
            COALESCE(SUM(CASE WHEN ct.card_status = 'APPROVED' THEN ct.payment_balance ELSE 0 END), 0) AS amount,
            COALESCE(SUM(CASE WHEN ct.card_status = 'APPROVED' THEN 1 ELSE 0 END), 0)                  AS cnt
        FROM card_transaction ct
        JOIN merchant  m ON m.merchant_id = ct.merchant_id
        JOIN category  c ON c.category_id = m.category_id
        WHERE ct.user_id = :userId
          AND ct.transaction_ymd LIKE :ymPrefix
        GROUP BY c.category_id, c.name
        ORDER BY amount DESC
        """, nativeQuery = true)
    List<Object[]> groupByCategoryRaw(@Param("userId") long userId,
                                      @Param("ymPrefix") String ymPrefix);

    /* 기간 내 카테고리별 합계/건수 — 리스트 상단 합계 블록 */
    @Query(value = """
        SELECT
            c.category_id AS categoryId,
            c.name        AS categoryName,
            COALESCE(SUM(CASE WHEN ct.card_status = 'APPROVED' THEN ct.payment_balance ELSE 0 END), 0) AS totalAmount,
            COALESCE(SUM(CASE WHEN ct.card_status = 'APPROVED' THEN 1 ELSE 0 END), 0)                  AS cnt
        FROM card_transaction ct
        JOIN merchant  m ON m.merchant_id = ct.merchant_id
        JOIN category  c ON c.category_id = m.category_id
        WHERE ct.user_id = :userId
          AND ct.transaction_ymd BETWEEN :fromYmd AND :toYmd
        GROUP BY c.category_id, c.name
        ORDER BY c.category_id
        """, nativeQuery = true)
    List<Object[]> findCategoryTotalsRaw(@Param("userId") long userId,
                                         @Param("fromYmd") String fromYmd,
                                         @Param("toYmd")   String toYmd);

    /* 기간 내 카테고리별 전체 거래 (승인건만, 최신순) */
    @Query(value = """
        SELECT
            c.category_id            AS categoryId,
            c.name                   AS categoryName,
            ct.transaction_unique_no AS txNo,
            ct.transaction_ymd       AS ymd,
            ct.transaction_hms       AS hms,
            ct.payment_balance       AS amount,
            ct.card_status           AS cardStatus,
            m.merchant_id            AS merchantId,
            m.merchant_name          AS merchantName,
            uc.user_card_id          AS userCardId,
            cp.card_name             AS cardName
        FROM card_transaction ct
        JOIN merchant     m  ON m.merchant_id     = ct.merchant_id
        JOIN category     c  ON c.category_id     = m.category_id
        JOIN user_card    uc ON uc.user_card_id   = ct.user_card_id
        JOIN card_product cp ON cp.card_unique_no = uc.card_unique_no
        WHERE ct.user_id = :userId
          AND ct.card_status = 'APPROVED'
          AND ct.transaction_ymd BETWEEN :fromYmd AND :toYmd
        ORDER BY c.category_id, ct.transaction_ymd DESC, ct.transaction_hms DESC
        """, nativeQuery = true)
    List<Object[]> findCategoryAllTransactionsRaw(@Param("userId") long userId,
                                                  @Param("fromYmd") String fromYmd,
                                                  @Param("toYmd")   String toYmd);
}
