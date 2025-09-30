package com.ssafy.toktokggubi.domain.user.dto.response;

import com.ssafy.toktokggubi.global.dto.response.TokenEnvelope;
import lombok.Builder;

public record LoginResponse(String message, Long userId, TokenEnvelope token) {
    @Builder
    public LoginResponse {
    }
}
