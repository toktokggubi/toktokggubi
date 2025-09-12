package com.ssafy.toktokggubi.domain.auth.dto.response;

import com.ssafy.toktokggubi.global.dto.response.TokenEnvelope;
import lombok.Builder;

public record RefreshResponse(TokenEnvelope token) {
    @Builder public RefreshResponse {}
}