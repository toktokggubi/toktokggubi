package com.ssafy.toktokggubi.domain.category.repository;

import com.ssafy.toktokggubi.domain.category.entity.Category;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByNameContaining(String keyword, Sort sort);

    @Query("select c.name from Category c where c.categoryId = :id")
    String findNameById(@Param("id") Long id);
}
