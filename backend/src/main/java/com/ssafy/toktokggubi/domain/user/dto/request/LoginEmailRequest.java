package com.ssafy.toktokggubi.domain.user.dto.request;

import jakarta.validation.constraints.*;

public record LoginEmailRequest(
        @Email @NotBlank String email,
        @NotBlank String password
) {}