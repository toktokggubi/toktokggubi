package com.ssafy.toktokggubi.domain.franchise.dto.response;

import java.util.List;

public record FranchiseListResponse(
        List<FranchiseItemResponse> items
) {
}

