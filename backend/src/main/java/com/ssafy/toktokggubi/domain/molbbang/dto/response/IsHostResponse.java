package com.ssafy.toktokggubi.domain.molbbang.dto.response;

import lombok.Builder;

@Builder
public record IsHostResponse(
        boolean inRoom,
        boolean isHost,
        String roomCode
) {}