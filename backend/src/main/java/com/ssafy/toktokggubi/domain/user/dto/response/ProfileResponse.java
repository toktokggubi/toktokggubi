package com.ssafy.toktokggubi.domain.user.dto.response;

import com.ssafy.toktokggubi.domain.user.entity.Gender;
import lombok.Builder;

public record ProfileResponse(
        Long userId, String nickname, Gender gender,
        String ageGroup, String jobTitle, Long monthlyIncome) {
    @Builder
    public ProfileResponse {
    }
}