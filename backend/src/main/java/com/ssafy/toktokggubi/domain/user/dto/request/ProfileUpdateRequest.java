package com.ssafy.toktokggubi.domain.user.dto.request;

import jakarta.annotation.Nullable;
import jakarta.validation.constraints.Size;

public record ProfileUpdateRequest(
        @Nullable @Size(max = 50) String nickname,
        @Nullable @Size(max = 20) String ageGroup,
        @Nullable @Size(max = 50) String jobTitle,
        @Nullable Long monthlyIncome) {
}