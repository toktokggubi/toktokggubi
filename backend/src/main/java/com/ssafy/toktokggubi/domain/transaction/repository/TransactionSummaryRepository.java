package com.ssafy.toktokggubi.domain.transaction.repository;

import com.ssafy.toktokggubi.domain.transaction.entity.CardTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TransactionSummaryRepository extends JpaRepository<CardTransaction, String> {

    @Query(value = """
        SELECT
          COALESCE(SUM(CASE WHEN ct.card_status = 'APPROVED' THEN ct.payment_balance ELSE 0 END), 0) AS total_amount,
          COALESCE(SUM(CASE WHEN ct.card_status = 'APPROVED' THEN 1 ELSE 0 END), 0)                 AS total_count
        FROM card_transaction ct
        WHERE ct.user_id = :userId
          AND ct.transaction_ymd BETWEEN :fromYmd AND :toYmd
        """, nativeQuery = true)
    List<Object[]> sumForUserRange(@Param("userId") long userId,
                                   @Param("fromYmd") String fromYmd,
                                   @Param("toYmd") String toYmd);



}
