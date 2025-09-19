package com.ssafy.toktokggubi.domain.transaction.repository;

import com.ssafy.toktokggubi.domain.transaction.entity.CardStatus;
import com.ssafy.toktokggubi.domain.transaction.entity.CardTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


import java.util.Optional;

@Repository
public interface CardTransactionRepository extends JpaRepository<CardTransaction, String> {

    // 거래 단건 조회
    Optional<CardTransaction> findByTransactionUniqueNo(String transactionUniqueNo);

    // 현달/카테고리 누적 합계(승인건) — 전부 엔티티 경로로 조인
    @Query("""
    SELECT COALESCE(SUM(ct.paymentBalance), 0)
      FROM CardTransaction ct
      JOIN ct.merchant m
      JOIN m.category c
     WHERE ct.user.userId = :userId
       AND ct.cardStatus = :status
       AND FUNCTION('DATE_FORMAT', ct.transactionYmd, '%Y%m') = :budgetYm
       AND c.categoryId = :categoryId
""")
    long sumByUserMonthAndCategory(
            @Param("userId") long userId,
            @Param("budgetYm") String budgetYm,  // "YYYYMM"
            @Param("categoryId") long categoryId,
            @Param("status") CardStatus status
    );

    @Query("""
    SELECT COALESCE(SUM(ct.paymentBalance), 0)
      FROM CardTransaction ct
     WHERE ct.user.userId = :userId
       AND ct.cardStatus = :status
       AND FUNCTION('DATE_FORMAT', ct.transactionYmd, '%Y%m') = :budgetYm
""")
    long sumByUserMonth(
            @Param("userId") long userId,
            @Param("budgetYm") String budgetYm,  // "YYYYMM"
            @Param("status") CardStatus status
    );



}