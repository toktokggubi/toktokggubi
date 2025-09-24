package com.ssafy.toktokggubi.domain.molbbang.repository;

import com.ssafy.toktokggubi.domain.molbbang.entity.MolbbangScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MolbbangScoreRepository extends JpaRepository<MolbbangScore, Long> {
    boolean existsByRound_RoundIdAndMember_MemberId(Long roundId, Long memberId);

    @Query(value = """
        SELECT mm.member_id AS memberId, mm.user_id AS userId, mm.nickname AS nickname,\s
               COALESCE(SUM(ms.score), 0) AS totalScore
        FROM molbbang_member mm
        LEFT JOIN molbbang_round mrd ON mrd.room_id = :roomId
        LEFT JOIN molbbang_score ms  ON ms.round_id = mrd.round_id AND ms.member_id = mm.member_id
        WHERE mm.room_id = :roomId AND mm.is_active = TRUE
        GROUP BY mm.member_id, mm.user_id, mm.nickname
       \s""", nativeQuery = true)
    List<Object[]> aggregateRoomTotals(Long roomId);

    @Query(value = """
        SELECT  t.member_id
        FROM (
            SELECT mm.member_id, COALESCE(SUM(ms.score), 0) AS total_score
            FROM molbbang_member mm
            LEFT JOIN molbbang_round mrd ON mrd.room_id = :roomId
            LEFT JOIN molbbang_score ms  ON ms.round_id = mrd.round_id AND ms.member_id = mm.member_id
            WHERE mm.room_id = :roomId AND mm.is_active = TRUE
            GROUP BY mm.member_id
        ) t
        ORDER BY t.total_score ASC
        LIMIT 1
        """, nativeQuery = true)
    Long findJackpotMemberId(Long roomId);
}
