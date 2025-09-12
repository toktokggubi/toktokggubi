package com.ssafy.toktokggubi.domain.transaction.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.math.BigInteger;

@Repository
public class TransactionSummaryRepository {

    @PersistenceContext
    private EntityManager em;

    /**
     * 기간 합계 (YYYYMMDD ~ YYYYMMDD, 양끝 포함)
     */
    public SummaryRow sumForUserRange(long userId, String fromYmd, String toYmd) {
        Object[] row = (Object[]) em.createNativeQuery("""
            SELECT
                COALESCE(SUM(CASE WHEN ct.card_status = 'APPROVED' THEN ct.payment_balance ELSE 0 END), 0) AS totalAmount,
                COALESCE(SUM(CASE WHEN ct.card_status = 'APPROVED' THEN 1 ELSE 0 END), 0)                   AS totalCount
            FROM card_transaction ct
            WHERE ct.user_id = ?
              AND ct.transaction_ymd BETWEEN ? AND ?
        """)
                .setParameter(1, userId)
                .setParameter(2, fromYmd)  // 예: "20250901"
                .setParameter(3, toYmd)    // 예: "20250930"
                .getSingleResult();

        long totalAmount = toLong(row[0]); // MySQL SUM -> BigDecimal일 수 있음
        long totalCount  = toLong(row[1]);
        return new SummaryRow(totalAmount, totalCount);
    }

    private long toLong(Object o) {
        if (o == null) return 0L;
        if (o instanceof BigDecimal bd) return bd.longValue();
        if (o instanceof BigInteger bi) return bi.longValue();
        if (o instanceof Number n)      return n.longValue();
        try { return Long.parseLong(o.toString()); } catch (Exception e) { return 0L; }
    }

    public record SummaryRow(long totalAmount, long totalCount) {}
}
