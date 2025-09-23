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

    // 토큰 문자열만 바로 조회 (성능/메모리 효율 good)
    @Query("""
        select t.token
        from PushToken t
        where t.user.userId = :userId
          and t.isActive = true
    """)
    static List<String> findActiveTokenStringsByUserId(@Param("userId") Long userId) {
        return null;
    }
}
