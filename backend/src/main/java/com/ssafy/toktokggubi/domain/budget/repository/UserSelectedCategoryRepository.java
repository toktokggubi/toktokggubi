package com.ssafy.toktokggubi.domain.budget.repository;

import com.ssafy.toktokggubi.domain.budget.entity.UserSelectedCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserSelectedCategoryRepository extends JpaRepository<UserSelectedCategory, Long> {
    Optional<UserSelectedCategory> findByUser_UserIdAndCategory_CategoryId(Long userId, Long categoryId);

    // 선택 목록을 한 번에 조회할 때 사용
    List<UserSelectedCategory> findByUser_UserIdAndCategory_CategoryIdIn(Long userId, Collection<Long> categoryIds);
}
