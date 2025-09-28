package com.ssafy.toktokggubi.domain.molbbang.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public record RoomView(
        String roomCode,
        Long amount,
        String status,
        LocalDateTime startedAt,
        List<MemberView> members
) {
    public record MemberView(
            Long memberId,
            Long userId,
            String nickname,
            boolean ready,
            boolean host,
            boolean active
    ) {
    }
}
