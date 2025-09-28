package com.ssafy.toktokggubi.domain.molbbang.repository;

import com.ssafy.toktokggubi.domain.molbbang.entity.MolbbangRoom;
import com.ssafy.toktokggubi.domain.molbbang.entity.RoomStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface MolbbangRoomRepository extends JpaRepository<MolbbangRoom, Long> {
    Optional<MolbbangRoom> findByRoomCode(String code);

    @Query("""
                select r
                from MolbbangRoom r
                join MolbbangMember m on m.room = r
                where m.user.userId = :userId
                  and r.status = :status
                order by r.endedAt desc
            """)
    List<MolbbangRoom> findRecentRoomsByUserAndStatus(Long userId, RoomStatus status, Pageable pageable);
}