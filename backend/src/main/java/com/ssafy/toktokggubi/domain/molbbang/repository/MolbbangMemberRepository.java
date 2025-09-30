package com.ssafy.toktokggubi.domain.molbbang.repository;

import com.ssafy.toktokggubi.domain.molbbang.entity.MolbbangMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MolbbangMemberRepository extends JpaRepository<MolbbangMember, Long> {
    List<MolbbangMember> findByUser_UserIdAndActiveTrue(Long userId);

    boolean existsByRoom_RoomIdAndNickname(Long roomId, String nickname);

    Optional<MolbbangMember> findByRoom_RoomIdAndUser_UserId(Long roomId, Long userId);

    List<MolbbangMember> findByRoom_RoomIdAndActiveTrue(Long roomId);

    List<MolbbangMember> findByRoom_RoomId(Long roomId);
}