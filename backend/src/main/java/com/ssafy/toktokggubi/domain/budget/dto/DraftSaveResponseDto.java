package com.ssafy.toktokggubi.domain.budget.dto;

public record DraftSaveResponseDto(
        String draftId,
        Integer version,
        DraftSnapshotDto snapshot,
        long ttlSeconds
) {
}

