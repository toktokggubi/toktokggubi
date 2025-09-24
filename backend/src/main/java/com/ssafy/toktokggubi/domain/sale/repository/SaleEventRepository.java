package com.ssafy.toktokggubi.domain.sale.repository;

import com.ssafy.toktokggubi.domain.sale.entity.SaleEvent;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SaleEventRepository extends JpaRepository<SaleEvent, Long> {

    /**
     * [start, endExclusive) 구간과 이벤트 겹침 조건:
     *  - 이벤트 시작 < endExclusive
     *  - 이벤트 종료 >= startInclusive
     * franchiseId가 null이면 전체
     */
    @Query("""
        select se
        from SaleEvent se
        join fetch se.franchise f
        where se.startsAt < :endExclusive
          and se.endsAt >= :startInclusive
          and (:franchiseId is null or f.franchiseId = :franchiseId)
        order by se.startsAt asc, se.saleEventId asc
        """)
    List<SaleEvent> findOverlapping(
            @Param("startInclusive") LocalDateTime startInclusive,
            @Param("endExclusive") LocalDateTime endExclusive,
            @Param("franchiseId") Long franchiseId
    );
}
