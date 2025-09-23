package com.ssafy.toktokggubi.domain.push.repository;

import com.ssafy.toktokggubi.domain.push.entity.PushToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface DevicePushTokenRepository extends JpaRepository<PushToken, Long> {

    Optional<PushToken> findByToken(String token);
    Optional<PushToken> findByTokenAndUser_UserId(String token, Long userId);
    List<PushToken> findByUser_UserIdAndIsActiveTrue(Long userId);
    List<PushToken> findByUser_UserIdInAndIsActiveTrue(Collection<Long> userIds);
}
