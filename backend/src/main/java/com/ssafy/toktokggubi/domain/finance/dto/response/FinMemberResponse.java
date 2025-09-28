package com.ssafy.toktokggubi.domain.finance.dto.response;

public record FinMemberResponse(
        String userId,
        String userName,
        String institutionCode,
        String userKey,
        String created,
        String modified
) {
}