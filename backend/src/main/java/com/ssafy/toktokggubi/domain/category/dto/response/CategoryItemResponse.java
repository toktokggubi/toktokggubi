package com.ssafy.toktokggubi.domain.category.dto.response;

public record CategoryItemResponse(
        Long categoryId,
        String name,
        String description,
        Integer sortOrder
) {}

