package com.ssafy.toktokggubi.domain.auth.controller;

import com.ssafy.toktokggubi.domain.auth.dto.request.KakaoLoginRequest;
import com.ssafy.toktokggubi.domain.auth.dto.response.KakaoLoginResponse;
import com.ssafy.toktokggubi.domain.auth.service.KakaoAuthService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth/kakao")
@RequiredArgsConstructor
@Tag(name = "카카오 인증", description = "카카오 로그인 API")
public class KakaoAuthController {
    private final KakaoAuthService kakaoAuthService;

    @PostMapping("/login")
    public KakaoLoginResponse login(@RequestBody KakaoLoginRequest req) {
        return kakaoAuthService.login(req);
    }
}
