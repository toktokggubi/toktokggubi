package com.ssafy.toktokggubi.domain.user.dto.response;

import com.ssafy.toktokggubi.global.dto.response.TokenEnvelope;
import lombok.Builder;

public record SignupEmailResponse(Long userId, String message, TokenEnvelope token) {
    @Builder public SignupEmailResponse {}
}
