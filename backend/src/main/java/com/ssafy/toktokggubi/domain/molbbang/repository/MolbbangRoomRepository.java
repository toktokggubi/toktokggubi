package com.ssafy.toktokggubi.domain.molbbang.repository;

import com.ssafy.toktokggubi.domain.molbbang.entity.MolbbangRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MolbbangRoomRepository extends JpaRepository<MolbbangRoom, Long> {
    Optional<MolbbangRoom> findByRoomCode(String roomCode);
}
