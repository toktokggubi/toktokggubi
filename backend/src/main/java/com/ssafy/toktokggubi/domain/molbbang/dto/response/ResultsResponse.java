package com.ssafy.toktokggubi.domain.molbbang.dto.response;

import java.util.List;

public record ResultsResponse(
        boolean ok,
        List<RankingRow> ranking,
        Long jackpotUserId,
        Long amount
) {
    public record RankingRow(
            Long userId,
            String nickname,
            Integer totalScore,
            Integer rank
    ) { }
}