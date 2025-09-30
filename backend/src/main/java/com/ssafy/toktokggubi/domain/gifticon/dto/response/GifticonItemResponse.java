package com.ssafy.toktokggubi.domain.gifticon.dto.response;

import com.ssafy.toktokggubi.domain.gifticon.entity.GifticonStatus;

import java.time.LocalDate;

public record GifticonItemResponse(
        Long gifticonId,
        String label,
        Long franchiseId,
        String franchiseName,
        String imageUrl,
        LocalDate expiresAt,
        Long daysUntilExpire,    // null 가능
        GifticonStatus status
) {
}
