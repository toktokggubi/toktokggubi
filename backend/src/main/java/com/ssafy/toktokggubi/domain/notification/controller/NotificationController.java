// src/main/java/com/ssafy/toktokggubi/domain/ai/controller/AiNotificationController.java
package com.ssafy.toktokggubi.domain.notification.controller;

import com.ssafy.toktokggubi.domain.notification.dto.NotificationListResponse;
import com.ssafy.toktokggubi.domain.notification.dto.NotificationReadResponse;
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
    public NotificationListResponse listRecent(

    ) {
        Long userId = SecurityUtils.currentUserIdOrNull();
        if (userId == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인 필요");
        log.info("current userId = {}", SecurityUtils.currentUserIdOrNull());
        // 기본값 내부 적용
        final String read = "all";
        final Integer limit = 20;

        String ym = ymResolver.nowYm();
        return service.listByReadFilter(userId, read, limit, ym);
    }

    // 읽음 처리 (read_at 채우기)
    @PatchMapping("/notification/read")
    public NotificationReadResponse markRead() {
        Long userId = SecurityUtils.currentUserIdOrNull();
        if (userId == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인 필요");
        log.info("current userId = {}", SecurityUtils.currentUserIdOrNull());
        String ym = ymResolver.nowYm(); // 현재 달
        int updated = service.markAllUnreadInMonthAsRead(userId, ym);
        return new NotificationReadResponse(updated);
    }
}
