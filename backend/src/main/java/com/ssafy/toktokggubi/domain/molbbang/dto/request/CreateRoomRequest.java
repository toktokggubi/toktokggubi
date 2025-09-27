package com.ssafy.toktokggubi.domain.molbbang.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CreateRoomRequest(
        @NotNull @Min(1) Long amount,
        String nickname
) {}
