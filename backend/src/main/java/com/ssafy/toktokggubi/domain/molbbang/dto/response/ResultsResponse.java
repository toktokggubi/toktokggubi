package com.ssafy.toktokggubi.domain.molbbang.dto.response;

import java.util.List;

public record ResultsResponse(
        boolean ok,
        List<RankingRow> ranking,
        Long jackpotUserId, // 꼴찌가 혼자일 때만 해당 userId
        Long amount
) {
    public record RankingRow(Long userId, String nickname, Integer score, Integer rank) {}
}