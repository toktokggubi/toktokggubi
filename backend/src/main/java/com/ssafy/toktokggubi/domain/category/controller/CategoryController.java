package com.ssafy.toktokggubi.domain.category.controller;

import com.ssafy.toktokggubi.domain.category.dto.response.CategoryListResponse;
import com.ssafy.toktokggubi.domain.category.service.CategoryService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/categories")
@Tag(name = "카테고리", description = "카테고리 목록 조회")
public class CategoryController {

    private final CategoryService categoryService;

    /**
     * 카테고리 목록 조회
     */
    @GetMapping
    public ResponseEntity<CategoryListResponse> list(
            @RequestParam(required = false) String q
    ) {
        return ResponseEntity.ok(categoryService.list(q));
    }
}
