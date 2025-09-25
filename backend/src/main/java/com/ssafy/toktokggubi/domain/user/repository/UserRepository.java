package com.ssafy.toktokggubi.domain.user.repository;

import com.ssafy.toktokggubi.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;     // ← 추가
import org.springframework.data.repository.query.Param; // ← 추가

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByKakaoSub(String kakaoSub);
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByUserIdAndNickname(Long userId, String nickname);

    @Query("select u.monthlyIncome from User u where u.userId = :userId")
    Optional<Long> findMonthlyIncome(@Param("userId") Long userId);
}
