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
    // 합계 (TOTAL)
    @Query("""
  select coalesce(sum(ct.paymentBalance), 0)
  from CardTransaction ct
  where ct.user.userId = :userId
    and ct.cardStatus = :status
    and function('date_format', ct.transactionYmd, '%Y%m') = :budgetYm
""")
    long sumByUserMonth(@Param("userId") Long userId,
                        @Param("budgetYm") String budgetYm, // "202509"
                        @Param("status") com.ssafy.toktokggubi.domain.transaction.entity.CardStatus status);

    // 합계 (CATEGORY)
    @Query("""
  select coalesce(sum(ct.paymentBalance), 0)
  from CardTransaction ct
  where ct.user.userId = :userId
    and ct.cardStatus = :status
    and ct.merchant.category.categoryId = :categoryId
    and function('date_format', ct.transactionYmd, '%Y%m') = :budgetYm
""")
    long sumByUserMonthAndCategory(@Param("userId") Long userId,
                                   @Param("budgetYm") String budgetYm,
                                   @Param("categoryId") Long categoryId,
                                   @Param("status") com.ssafy.toktokggubi.domain.transaction.entity.CardStatus status);

    @Query(value = """
    SELECT COUNT(*)
      FROM card_transaction
     WHERE user_id = :userId
       AND merchant_id = :merchantId
       AND card_status = :status
       AND DATE_FORMAT(transaction_ymd, '%Y%m') = :ym
""", nativeQuery = true)
    long countByUserMonthAndMerchant(
            @Param("userId") Long userId,
            @Param("ym") String yearMonth,           // 예: "202509"
            @Param("merchantId") Long merchantId,
            @Param("status") String status           // Enum이면 status.name()으로 넘겨도 됨
    );


}