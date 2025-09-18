package com.ssafy.toktokggubi.domain.user.repository;

import com.ssafy.toktokggubi.domain.user.entity.UserCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserCardRepository extends JpaRepository<UserCard, Long> {
    Optional<UserCard> findByUser_UserIdAndCardProduct_CardUniqueNo(Long userId, String cardUniqueNo);
}
