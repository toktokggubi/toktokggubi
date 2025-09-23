package com.ssafy.toktokggubi.domain.push.dto;


public record NotificationLogDto(
        boolean triggered,   // 조건 충족 여부
        Long userId,         // 사용자 ID
        String budgetYm,     // "yyyyMM"
        Long usedAmount,     // 누적 사용액
        Long finalAmount,    // 최종 예산액(없으면 null 가능)
        boolean sent         // 실제 발송했는지(중복이면 false)
) {}