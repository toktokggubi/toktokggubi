package com.ssafy.toktokggubi.domain.molbbang.repository;

import com.ssafy.toktokggubi.domain.molbbang.entity.MolbbangScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MolbbangScoreRepository extends JpaRepository<MolbbangScore, Long> {
    boolean existsByRoom_RoomIdAndMember_MemberId(Long roomId, Long memberId);

    // [memberId, userId, nickname, totalScore]
    @Query("""
      SELECT ms.member.memberId, mm.user.userId, mm.nickname, SUM(ms.score)
      FROM MolbbangScore ms
      JOIN MolbbangMember mm ON mm.memberId = ms.member.memberId
      WHERE ms.room.roomId = :roomId
      GROUP BY ms.member.memberId, mm.user.userId, mm.nickname
    """)
    List<Object[]> aggregateRoomTotals(Long roomId);
}