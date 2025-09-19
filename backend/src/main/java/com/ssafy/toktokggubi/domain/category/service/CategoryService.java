package com.ssafy.toktokggubi.domain.category.service;

import com.ssafy.toktokggubi.domain.category.dto.response.CategoryItemResponse;
import com.ssafy.toktokggubi.domain.category.dto.response.CategoryListResponse;
import com.ssafy.toktokggubi.domain.category.entity.Category;
import com.ssafy.toktokggubi.domain.category.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;

    /**
     * @param q    부분 검색 (name LIKE %q%), null 허용
     * @param sort sortOrder|name (기본 sortOrder ASC)
     */
    public CategoryListResponse list(String q, String sort) {
        Sort s = switch (sort == null ? "" : sort.toLowerCase()) {
            case "name" -> Sort.by(Sort.Direction.ASC, "name");
            default -> Sort.by(Sort.Direction.ASC, "sortOrder").and(Sort.by("name"));
        };

        List<Category> rows = (q == null || q.isBlank())
                ? categoryRepository.findAll(s)
                : categoryRepository.findByNameContaining(q, s);

        var items = rows.stream()
                .map(c -> new CategoryItemResponse(
                        c.getCategoryId(), c.getName(), c.getDescription(), c.getSortOrder()))
                .toList();

        return new CategoryListResponse(items);
    }
}
