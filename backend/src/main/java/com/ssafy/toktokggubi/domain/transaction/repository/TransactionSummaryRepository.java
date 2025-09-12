package com.ssafy.toktokggubi.domain.transaction.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.List;

@Repository
public class TransactionSummaryRepository {

    @PersistenceContext
    private EntityManager em;

    public SummaryRow sumForUserMonth(long userId, String ym) {
        String ymPrefix = ym + "%"; // 자바에서 미리 만들어 전달

        @SuppressWarnings("unchecked")
        List<Object[]> rows = em.createNativeQuery("""
            SELECT
                COALESCE(SUM(CASE WHEN ct.card_status = 'APPROVED' THEN ct.payment_balance ELSE 0 END), 0) AS totalAmount,
                COALESCE(SUM(CASE WHEN ct.card_status = 'APPROVED' THEN 1 ELSE 0 END), 0)              AS totalCount
            FROM card_transaction ct
            WHERE ct.user_id = ?
              AND ct.transaction_ymd LIKE ?
        """)
                .setParameter(1, userId)     // 위치 파라미터: ? (번호 없이)
                .setParameter(2, ymPrefix)   // ex) "202509%"
                .getResultList();

        Object[] row = (rows.isEmpty() || rows.get(0) == null)
                ? new Object[]{BigDecimal.ZERO, BigInteger.ZERO}
                : rows.get(0);

        long totalAmount = toLong(row[0]);  // BigDecimal/BigInteger/Long/Integer/String 방어
        long totalCount  = toLong(row[1]);

        return new SummaryRow(totalAmount, totalCount);
    }

    private long toLong(Object o) {
        if (o == null) return 0L;
        if (o instanceof BigDecimal bd) return bd.longValue();
        if (o instanceof BigInteger bi) return bi.longValue();
        if (o instanceof Number n) return n.longValue();
        try { return Long.parseLong(o.toString()); } catch (Exception ignore) { return 0L; }
    }

    public record SummaryRow(long totalAmount, long totalCount) {}
}
