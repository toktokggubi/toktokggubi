package com.ssafy.toktokggubi.domain.user.dto.request;

import jakarta.validation.constraints.NotBlank;

public record PasswordResetRequest(@NotBlank String email) {}
