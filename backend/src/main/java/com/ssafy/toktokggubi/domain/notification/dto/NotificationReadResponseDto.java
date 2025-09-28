// src/main/java/com/ssafy/toktokggubi/domain/notification/dto/NotificationReadResponse.java
package com.ssafy.toktokggubi.domain.notification.dto;

public record NotificationReadResponseDto(
        long updatedCount            // 이번 요청으로 실제 read_at이 채워진(row 업데이트) 개수
) {
}
