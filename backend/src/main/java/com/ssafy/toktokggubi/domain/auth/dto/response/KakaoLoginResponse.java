package com.ssafy.toktokggubi.domain.auth.dto.response;

import com.ssafy.toktokggubi.global.dto.response.TokenEnvelope;
import lombok.Builder;

public record KakaoLoginResponse(String message, Long userId, TokenEnvelope token) {
    @Builder public KakaoLoginResponse {}
}