package com.ssafy.toktokggubi.domain.molbbang.dto.response;

import java.util.List;

public record RoomView(
        String code,
        Long amount,
        String status,
        Integer round,
        Integer totalRounds,
        List<MemberView> members
) {
    public record MemberView(
            Long memberId,
            Long userId,
            String nickname,
            boolean ready,
            boolean host,
            boolean active
    ) { }
}
