package com.ssafy.toktokggubi.domain.auth.dto.response;

import com.ssafy.toktokggubi.global.dto.response.TokenEnvelope;
import lombok.Builder;

public record KakaoLoginResponse(
        Long userId,
        String message,
        String signupToken,      // 신규/INACTIVE
        TokenEnvelope token      // ACTIVE
) {
    @Builder
    public KakaoLoginResponse {
    }
}