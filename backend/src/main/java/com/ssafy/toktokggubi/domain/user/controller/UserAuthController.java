package com.ssafy.toktokggubi.domain.user.controller;

import com.ssafy.toktokggubi.domain.auth.dto.request.RefreshRequest;
import com.ssafy.toktokggubi.domain.auth.dto.response.RefreshResponse;
import com.ssafy.toktokggubi.domain.user.dto.request.*;
import com.ssafy.toktokggubi.domain.user.dto.response.*;
import com.ssafy.toktokggubi.domain.user.service.UserAuthService;
import com.ssafy.toktokggubi.global.dto.response.MessageResponse;
import com.ssafy.toktokggubi.global.security.jwt.JwtProvider;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping
@RequiredArgsConstructor
@Tag(name = "유저 인증", description = "유저 인증 API")
public class UserAuthController {
    private final UserAuthService authService;
    private final JwtProvider jwtProvider;

    @PostMapping("/auth/signup")
    public SignupEmailResponse signup(@RequestBody @Valid SignupEmailRequest req) {
        return authService.signup(req);
    }

    @PostMapping("/auth/login")
    public LoginResponse login(@RequestBody @Valid LoginEmailRequest req) {
        return authService.login(req);
    }

    @PostMapping("/auth/token/refresh")
    public RefreshResponse refresh(@RequestBody @Valid RefreshRequest req) {
        return authService.refresh(req);
    }

    @PostMapping("/auth/logout")
    public ResponseEntity<MessageResponse> logout(
            @RequestHeader(name = HttpHeaders.AUTHORIZATION, required = false) String auth) {

        if (auth == null || !auth.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(new MessageResponse("인증 토큰이 없습니다."));
        }

        String access = auth.substring(7);
        Long userId = jwtProvider.parseUserId(access);

        authService.logout(userId, access);
        return ResponseEntity.ok(new MessageResponse("로그아웃 완료"));
    }

    @PostMapping("/auth/password/reset")
    public MessageResponse resetPassword(@RequestBody @Valid PasswordResetRequest req) {
        authService.resetPasswordSendMail(req);
        return new MessageResponse("비밀번호 재설정 메일 발송 완료");
    }
}
