// src/main/java/com/ssafy/toktokggubi/domain/ai/controller/AiNotificationController.java
package com.ssafy.toktokggubi.domain.notification.controller;

import com.ssafy.toktokggubi.domain.notification.dto.NotificationDeleteResponseDto;
import com.ssafy.toktokggubi.domain.notification.dto.NotificationListResponseDto;
import com.ssafy.toktokggubi.domain.notification.dto.NotificationReadResponseDto;
import com.ssafy.toktokggubi.domain.notification.service.NotificationService;

import com.ssafy.toktokggubi.global.security.utils.SecurityUtils;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.ssafy.toktokggubi.global.time.YmResolver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/ai")
@Tag(name = "AI소비코칭 - 알림", description = "최근 알림 조회 API")
public class NotificationController {

    private final NotificationService service;
    private final YmResolver ymResolver;

    @GetMapping("/notification")
    public NotificationListResponseDto listRecent() {
        Long userId = SecurityUtils.currentUserIdOrNull();
        if (userId == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인 필요");

        final String read = "all";
        final Integer limit = 20;

        String ym = ymResolver.nowYm();
        return service.getMonthlyNotifications(userId, ym, read, limit);
    }

    // 읽음 처리 (read_at 채우기)
    @PatchMapping("/notification/read")
    public NotificationReadResponseDto markRead() {
        Long userId = SecurityUtils.currentUserIdOrNull();
        if (userId == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인 필요");

        String ym = ymResolver.nowYm();
        int updated = service.markMonthlyUnreadAsRead(userId, ym);
        return new NotificationReadResponseDto(updated);
    }

    // 이번 달 알림 삭제 처리
    @DeleteMapping("/notification")
    public NotificationDeleteResponseDto deleteThisMonthAll() {
        Long userId = SecurityUtils.currentUserIdOrNull();
        if (userId == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인 필요");

        String ym = ymResolver.nowYm();
        return service.deleteAllInMonth(userId, ym);
    }
}
