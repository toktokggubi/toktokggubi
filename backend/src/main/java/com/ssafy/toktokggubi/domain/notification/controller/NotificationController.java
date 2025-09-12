// src/main/java/com/ssafy/toktokggubi/domain/ai/controller/AiNotificationController.java
package com.ssafy.toktokggubi.domain.notification.controller;

import com.ssafy.toktokggubi.domain.notification.dto.NotificationListResponse;
import com.ssafy.toktokggubi.domain.notification.service.NotificationService;

import com.ssafy.toktokggubi.global.security.utils.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.ssafy.toktokggubi.global.time.YmResolver;
import io.swagger.v3.oas.annotations.responses.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

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

        // 기본값 내부 적용
        final String read = "unread";
        final Integer limit = 20;

        String ym = ymResolver.nowYm();
        return service.listByReadFilter(userId, read, limit, ym);
    }
}
