package com.ssafy.toktokggubi.domain.user.controller;

import com.ssafy.toktokggubi.config.SwaggerConfig;
import com.ssafy.toktokggubi.domain.auth.dto.request.RefreshRequest;
import com.ssafy.toktokggubi.domain.auth.dto.response.RefreshResponse;
import com.ssafy.toktokggubi.domain.user.dto.request.LoginEmailRequest;
import com.ssafy.toktokggubi.domain.user.dto.request.PasswordResetRequest;
import com.ssafy.toktokggubi.domain.user.dto.request.ProfileCreateRequest;
import com.ssafy.toktokggubi.domain.user.dto.request.SignupEmailRequest;
import com.ssafy.toktokggubi.domain.user.dto.response.LoginResponse;
import com.ssafy.toktokggubi.domain.user.dto.response.SignupEmailResponse;
import com.ssafy.toktokggubi.domain.user.service.UserAuthService;
import com.ssafy.toktokggubi.global.dto.response.MessageResponse;
import com.ssafy.toktokggubi.global.dto.response.TokenEnvelope;
import com.ssafy.toktokggubi.global.security.jwt.JwtProvider;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "유저 인증", description = "유저 인증 API")
public class UserAuthController {
    private final UserAuthService authService;
    private final JwtProvider jwtProvider;
    private final RestTemplate finopenRestTemplate;

    @Value("${ai.base-url}")
    private String aiBaseUrl;

    @PostMapping("/signup")
    public SignupEmailResponse signup(@RequestBody @Valid SignupEmailRequest req) {
        return authService.signup(req);
    }

    @PostMapping("/signup/complete")
    @Operation(security = @SecurityRequirement(name = SwaggerConfig.SIGNUP))
    public LoginResponse complete(
            @Parameter(hidden = true)
            @RequestHeader(HttpHeaders.AUTHORIZATION) String auth,
            @RequestBody @Valid ProfileCreateRequest req) {
        if (auth == null || !auth.startsWith("Bearer "))
            throw new IllegalArgumentException("가입 토큰이 필요합니다.");
        String token = auth.substring(7);
        Long userId = jwtProvider.parseSignupUserId(token);

        TokenEnvelope tok = authService.createProfile(userId, req);
        sendRequestToAI(userId, req.nickname());
        return LoginResponse.builder()
                .message("회원 가입 완료")
                .userId(userId)
                .token(tok)
                .build();
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody @Valid LoginEmailRequest req) {
        return authService.login(req);
    }

    @PostMapping("/token/refresh")
    public RefreshResponse refresh(@RequestBody @Valid RefreshRequest req) {
        return authService.refresh(req);
    }

    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout(
            @RequestHeader(name = HttpHeaders.AUTHORIZATION, required = false) String auth) {

        if (auth == null || !auth.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(new MessageResponse("인증 토큰이 없습니다."));
        }

        String access = auth.substring(7);
        Long userId = jwtProvider.parseAccessUserId(access);

        authService.logout(userId, access);
        return ResponseEntity.ok(new MessageResponse("로그아웃 완료"));
    }

    private void sendRequestToAI(Long userId, String username) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            Map<String, Object> requestData = new HashMap<>();
            requestData.put("user_id", userId);
            requestData.put("username", username);
            String url = aiBaseUrl + "/ai/model";
            String requestBody = objectMapper.writeValueAsString(requestData);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> request = new HttpEntity<>(requestBody, headers);
            finopenRestTemplate.postForEntity(url, request, String.class);
        } catch (Exception e) {
            log.error("Failed to send request to AI service for user {}: {}", userId, e.getMessage());
        }
    }

    @PostMapping("/password/reset")
    public MessageResponse resetPassword(@RequestBody @Valid PasswordResetRequest req) {
        authService.resetPasswordSendMail(req);
        return new MessageResponse("비밀번호 재설정 메일 발송 완료");
    }
}
