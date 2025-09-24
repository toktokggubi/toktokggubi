package com.ssafy.toktokggubi.domain.molbbang.repository;

import com.ssafy.toktokggubi.domain.molbbang.entity.MolbbangRound;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MolbbangRoundRepository extends JpaRepository<MolbbangRound, Long> {
    Optional<MolbbangRound> findByRoom_RoomIdAndRoundNo(Long roomId, Integer roundNo);
//    List<MolbbangRound> findByRoom_RoomId(Long roomId);
}