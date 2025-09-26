package com.ssafy.toktokggubi.domain.molbbang.dto.request;

import jakarta.validation.constraints.NotBlank;

public record JoinRoomRequest(
        @NotBlank String code,
        String nickname
) {}
