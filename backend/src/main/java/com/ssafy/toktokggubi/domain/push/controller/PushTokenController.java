package com.ssafy.toktokggubi.domain.push.controller;

import com.ssafy.toktokggubi.domain.push.dto.PushTokenRegisterRequest;
import com.ssafy.toktokggubi.domain.push.service.PushTokenService;
import com.ssafy.toktokggubi.global.security.utils.SecurityUtils;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/token")
@RequiredArgsConstructor
@Tag(name = "푸시 토큰", description = "디바이스 푸시 토큰 관리 API")
public class PushTokenController {

    private final PushTokenService pushTokenService;

    @PostMapping
    public ResponseEntity<Void> register(@RequestBody PushTokenRegisterRequest req) {
        Long userId = SecurityUtils.currentUserIdOrNull();
        pushTokenService.saveToken(userId, req.token());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> unregister(@RequestParam("token") String token) {
        Long userId = SecurityUtils.currentUserIdOrNull();
        pushTokenService.invalidateOwned(userId, token);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/all")
    public ResponseEntity<Void> unregisterAll() {
        Long userId = SecurityUtils.currentUserIdOrNull();
        pushTokenService.invalidateAllOwned(userId);
        return ResponseEntity.noContent().build();
    }
}
