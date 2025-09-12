package com.ssafy.toktokggubi.domain.user.dto.request;

import jakarta.validation.constraints.NotBlank;

public record PasswordChangeRequest(@NotBlank String currentPassword,
                                    @NotBlank String newPassword) {
}