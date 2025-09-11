package com.ssafy.toktokggubi.domain.budget.repository;

import com.ssafy.toktokggubi.domain.budget.entity.UserSelectedCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserSelectedCategoryRepository extends JpaRepository<UserSelectedCategory, Long> {
    Optional<UserSelectedCategory> findByUser_UserIdAndCategory_CategoryId(Long userId, Long categoryId);
}
