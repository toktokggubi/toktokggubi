package com.ssafy.toktokggubi.domain.user.repository;

import com.ssafy.toktokggubi.domain.user.entity.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserAccountRepository extends JpaRepository<UserAccount, Long> {
    Optional<UserAccount> findByUser_UserIdAndAccountNo(Long userId, String accountNo);
}
