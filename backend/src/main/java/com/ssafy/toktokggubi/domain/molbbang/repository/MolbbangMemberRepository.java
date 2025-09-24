package com.ssafy.toktokggubi.domain.molbbang.repository;

import com.ssafy.toktokggubi.domain.molbbang.entity.MolbbangMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MolbbangMemberRepository extends JpaRepository<MolbbangMember, Long> {
    List<MolbbangMember> findByRoom_RoomIdAndActiveTrue(Long roomId);
//    List<MolbbangMember> findByRoom_RoomIdAndHostTrue(Long roomId);
    Optional<MolbbangMember> findByRoom_RoomIdAndUser_UserId(Long roomId, Long userId);
    boolean existsByRoom_RoomIdAndNickname(Long roomId, String nickname);
    List<MolbbangMember> findByUser_UserIdAndActiveTrue(Long userId);
}