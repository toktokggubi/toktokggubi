package com.ssafy.toktokggubi.domain.transaction.repository;

import com.ssafy.toktokggubi.domain.transaction.dto.TxCategorySummaryItem;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.List;

@Repository
public class TransactionCategoryRepository {

    @PersistenceContext
    private EntityManager em;

    /**
     * (요약) 특정 월(yyyyMM) 카테고리별 합계/건수.
     * 컨트롤러의 /summary/category 같은 용도
     */
    public List<TxCategorySummaryItem> groupByCategory(long userId, String ym) {
        String ymPrefix = ym + "%"; // 202509%

        @SuppressWarnings("unchecked")
        List<Object[]> rows = em.createNativeQuery("""
            SELECT
                c.category_id AS categoryId,
                c.name        AS categoryName,
                COALESCE(SUM(CASE WHEN ct.card_status = 'APPROVED' THEN ct.payment_balance ELSE 0 END), 0) AS amount,
                COALESCE(SUM(CASE WHEN ct.card_status = 'APPROVED' THEN 1 ELSE 0 END), 0)                   AS cnt
            FROM card_transaction ct
            JOIN merchant m ON m.merchant_id = ct.merchant_id
            JOIN category c ON c.category_id = m.category_id
            WHERE ct.user_id = ?1
              AND ct.transaction_ymd LIKE ?2
            GROUP BY c.category_id, c.name
            ORDER BY amount DESC
        """)
                .setParameter(1, userId)
                .setParameter(2, ymPrefix)
                .getResultList();

        List<TxCategorySummaryItem> result = new ArrayList<>(rows.size());
        for (Object[] row : rows) {
            long categoryId   = toLong(row[0]);
            String categoryNm = row[1] == null ? "" : row[1].toString();
            long amount       = toLong(row[2]);
            long count        = toLong(row[3]);
            result.add(new TxCategorySummaryItem(categoryId, categoryNm, amount, count));
        }
        return result;
    }

    /**
     * (리스트 화면용) 기간 내 카테고리별 합계/건수
     * /transaction/category 에서 상단 합계 블록 구성
     */
    public List<CategoryTotalRow> findCategoryTotals(long userId, String fromYmd, String toYmd) {
        @SuppressWarnings("unchecked")
        List<Object[]> rows = em.createNativeQuery("""
            SELECT
                c.category_id AS categoryId,
                c.name        AS categoryName,
                COALESCE(SUM(CASE WHEN ct.card_status = 'APPROVED' THEN ct.payment_balance ELSE 0 END), 0) AS totalAmount,
                COALESCE(SUM(CASE WHEN ct.card_status = 'APPROVED' THEN 1 ELSE 0 END), 0)                  AS cnt
            FROM card_transaction ct
            JOIN merchant  m ON m.merchant_id = ct.merchant_id
            JOIN category  c ON c.category_id = m.category_id
            WHERE ct.user_id = ?1
              AND ct.transaction_ymd BETWEEN ?2 AND ?3
            GROUP BY c.category_id, c.name
            ORDER BY c.category_id
        """)
                .setParameter(1, userId)
                .setParameter(2, fromYmd)
                .setParameter(3, toYmd)
                .getResultList();

        List<CategoryTotalRow> list = new ArrayList<>(rows.size());
        for (Object[] r : rows) {
            list.add(new CategoryTotalRow(
                    toLong(r[0]),
                    (String) r[1],
                    toLong(r[2]),
                    toLong(r[3])
            ));
        }
        return list;
    }

    /**
     * (리스트 화면용) 기간 내 카테고리별 전체 거래 (승인건만, 최신순)
     * /transaction/category 에서 각 카테고리의 거래 목록 구성
     */
    public List<CategoryTxRow> findCategoryAllTransactions(long userId, String fromYmd, String toYmd) {
        @SuppressWarnings("unchecked")
        List<Object[]> rows = em.createNativeQuery("""
            SELECT
                c.category_id              AS categoryId,
                c.name                     AS categoryName,
                ct.transaction_unique_no   AS txNo,
                ct.transaction_ymd         AS ymd,
                ct.transaction_hms         AS hms,
                ct.payment_balance         AS amount,
                ct.card_status             AS cardStatus,
                m.merchant_id              AS merchantId,
                m.merchant_name            AS merchantName,
                uc.user_card_id            AS userCardId,
                cp.card_name               AS cardName
            FROM card_transaction ct
            JOIN merchant     m  ON m.merchant_id     = ct.merchant_id
            JOIN category     c  ON c.category_id     = m.category_id
            JOIN user_card    uc ON uc.user_card_id   = ct.user_card_id
            JOIN card_product cp ON cp.card_unique_no = uc.card_unique_no
            WHERE ct.user_id = ?1
              AND ct.card_status = 'APPROVED'
              AND ct.transaction_ymd BETWEEN ?2 AND ?3
            ORDER BY c.category_id, ct.transaction_ymd DESC, ct.transaction_hms DESC
        """)
                .setParameter(1, userId)
                .setParameter(2, fromYmd)
                .setParameter(3, toYmd)
                .getResultList();

        List<CategoryTxRow> list = new ArrayList<>();
        for (Object[] r : rows) {
            list.add(new CategoryTxRow(
                    toLong(r[0]),
                    (String) r[1],
                    (String) r[2],
                    (String) r[3],
                    (String) r[4],
                    toLong(r[5]),
                    (String) r[6],
                    toLong(r[7]),
                    (String) r[8],
                    toLong(r[9]),
                    (String) r[10]
            ));
        }
        return list;
    }

    /* ====== 변환 유틸 ====== */
    private static long toLong(Object o) {
        if (o == null) return 0L;
        if (o instanceof Long l) return l;
        if (o instanceof Integer i) return i.longValue();
        if (o instanceof BigInteger bi) return bi.longValue();
        if (o instanceof BigDecimal bd) return bd.longValue();
        if (o instanceof Number n) return n.longValue();
        try { return Long.parseLong(o.toString()); } catch (Exception e) { return 0L; }
    }

    /* ====== 결과 Row 타입 ====== */
    public record CategoryTotalRow(
            long categoryId,
            String categoryName,
            long totalAmount,
            long count
    ) {}

    public record CategoryTxRow(
            long categoryId,
            String categoryName,
            String transactionUniqueNo,
            String ymd,     // YYYYMMDD
            String hms,     // HHMMSS
            long amount,
            String cardStatus,
            long merchantId,
            String merchantName,
            long userCardId,
            String cardName
    ) {}
}
