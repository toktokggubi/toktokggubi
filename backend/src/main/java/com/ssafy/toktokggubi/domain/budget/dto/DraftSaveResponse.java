package com.ssafy.toktokggubi.domain.budget.dto;

public record DraftSaveResponse (
        String draftId,
        Integer version,
        DraftSnapshotDto snapshot,
        long ttlSeconds
){}

