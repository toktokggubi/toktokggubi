package com.ssafy.toktokggubi.domain.user.repository;

import com.ssafy.toktokggubi.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;     // ← 추가
import org.springframework.data.repository.query.Param; // ← 추가

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByKakaoSub(String kakaoSub);
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByUserIdAndNickname(Long userId, String nickname);

    @Query("select u.monthlyIncome from User u where u.userId = :userId")
    Optional<Long> findMonthlyIncome(@Param("userId") Long userId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
        delete from UserMonthlyBudget umb
        where umb.user.userId = :userId and umb.budgetYm = :ym
    """)
    void deleteUmb(@Param("userId") Long userId, @Param("ym") String ym);

    @Query("select u.userId from User u")
    List<Long> findAllUserIds();

    @Query("select u.nickname from User u where u.userId = :userId")
    String findNicknameByUserId(Long userId);
}
