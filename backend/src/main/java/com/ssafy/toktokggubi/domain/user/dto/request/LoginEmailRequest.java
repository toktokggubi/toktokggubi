package com.ssafy.toktokggubi.domain.user.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginEmailRequest(
        @Email @NotBlank String email,
        @NotBlank String password
) {
}