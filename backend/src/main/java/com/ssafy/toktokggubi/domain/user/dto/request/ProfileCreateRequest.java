package com.ssafy.toktokggubi.domain.user.dto.request;

import com.ssafy.toktokggubi.domain.user.entity.Gender;
import jakarta.validation.constraints.*;

public record ProfileCreateRequest(
        @NotBlank @Size(max = 50) String nickname,
        @NotNull Gender gender,
        @Size(max = 20) String ageGroup,
        @Size(max = 50) String jobTitle,
        Long monthlyIncome) {
}