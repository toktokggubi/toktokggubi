package com.ssafy.toktokggubi.domain.wallet.repository;

import com.ssafy.toktokggubi.domain.wallet.entity.UserCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserCardRepository extends JpaRepository<UserCard, Long> {
    Optional<UserCard> findByUser_UserIdAndCardProduct_CardUniqueNo(Long userId, String cardUniqueNo);
    List<UserCard> findByUser_UserIdAndIsActiveTrue(Long userId);
    Optional<UserCard> findByUser_UserIdAndUserCardId(Long userId, Long userCardId);
}
