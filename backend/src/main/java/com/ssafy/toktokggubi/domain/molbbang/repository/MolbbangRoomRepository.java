package com.ssafy.toktokggubi.domain.molbbang.repository;

import com.ssafy.toktokggubi.domain.molbbang.entity.MolbbangRoom;
import com.ssafy.toktokggubi.domain.molbbang.entity.RoomStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MolbbangRoomRepository extends JpaRepository<MolbbangRoom, Long> {
    Optional<MolbbangRoom> findByRoomCode(String code);
    Optional<MolbbangRoom> findTopByMembers_User_UserIdAndStatusOrderByEndedAtDesc(Long userId, RoomStatus status);
}