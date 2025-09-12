package com.ssafy.toktokggubi.global.dto.response;

import lombok.Builder;

public record TokenEnvelope(
        String accessToken,
        long expiresIn,
        String refreshToken,
        long refreshExpiresIn,
        String tokenType
) { @Builder public TokenEnvelope {} }