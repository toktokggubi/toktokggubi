package com.ssafy.toktokggubi.domain.user.dto.response;

import lombok.Builder;

public record SignupEmailResponse(String signupToken, String message) {
    @Builder
    public SignupEmailResponse {
    }
}
