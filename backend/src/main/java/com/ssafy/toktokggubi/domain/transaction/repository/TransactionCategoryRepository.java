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

    public List<TxCategorySummaryItem> groupByCategory(long userId, String ym) {
        String ymPrefix = ym + "%"; // ex) 202509%

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
            WHERE ct.user_id = ?
              AND ct.transaction_ymd LIKE ?
            GROUP BY c.category_id, c.name
            ORDER BY amount DESC
        """)
                .setParameter(1, userId)     // Hibernate 6: 위치 파라미터는 "?" 사용 + 인덱스 1부터
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

    private long toLong(Object o) {
        if (o == null) return 0L;
        if (o instanceof BigDecimal bd) return bd.longValue();
        if (o instanceof BigInteger bi) return bi.longValue();
        if (o instanceof Number n)      return n.longValue();
        try { return Long.parseLong(o.toString()); } catch (Exception ignore) { return 0L; }
    }
}
