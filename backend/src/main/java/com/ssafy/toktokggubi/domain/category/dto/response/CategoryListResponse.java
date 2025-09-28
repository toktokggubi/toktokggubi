package com.ssafy.toktokggubi.domain.category.dto.response;

import java.util.List;

public record CategoryListResponse(
        List<CategoryItemResponse> items
) {
}