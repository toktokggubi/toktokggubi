package com.ssafy.toktokggubi.domain.gifticon.dto.response;

import com.ssafy.toktokggubi.domain.gifticon.entity.GifticonStatus;

import java.time.LocalDate;

public record GifticonCreateResponse(
        Long gifticonId,
        String label,
        String brandName,         // OCR로 추출된 원본 브랜드명(그대로 반환)
        Long franchiseId,         // 매칭/신규 생성된 Franchise ID (없으면 null)
        String franchiseName,     // 저장된 Franchise 이름
        LocalDate expiresAt,
        String imageUrl,
        GifticonStatus status,
        String ocrPreview
) {
}
