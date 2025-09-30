package com.ssafy.toktokggubi.domain.user.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SignupEmailRequest(
        @Email @NotBlank String email,
        @Size(min = 8, max = 64) @NotBlank String password
) {
}