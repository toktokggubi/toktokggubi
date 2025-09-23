package com.ssafy.toktokggubi.domain.user.repository;

import com.ssafy.toktokggubi.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByKakaoSub(String kakaoSub);
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByUserIdAndNickname(Long userId, String nickname);
}
