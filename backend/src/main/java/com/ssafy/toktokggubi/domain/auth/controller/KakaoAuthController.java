package com.ssafy.toktokggubi.domain.auth.controller;

import com.ssafy.toktokggubi.domain.auth.client.KakaoApiClient;
import com.ssafy.toktokggubi.domain.auth.client.KakaoOAuthClient;
import com.ssafy.toktokggubi.domain.auth.dto.response.KakaoLoginResponse;
import com.ssafy.toktokggubi.domain.auth.dto.response.KakaoMe;
import com.ssafy.toktokggubi.domain.auth.service.KakaoAuthService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.Map;

@RestController
@RequestMapping("/auth/kakao")
@RequiredArgsConstructor
@Tag(name = "카카오 로그인", description = "카카오 로그인 API")
public class KakaoAuthController {
    private final KakaoOAuthClient oauth;
    private final KakaoApiClient kakaoApi;
    private final KakaoAuthService service;

    @Value("${kakao.rest-key}")
    private String kakaoRestKey;

    @Value("${kakao.redirect-uri}")
    private String kakaoRedirectUri;

    /** 프론트가 열 수 있는 authorize URL 제공 */
    @GetMapping("/authorize-url")
    public Map<String, String> authorizeUrl(
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String codeChallenge
    ) {
        UriComponentsBuilder b = UriComponentsBuilder
                .fromHttpUrl("https://kauth.kakao.com/oauth/authorize")
                .queryParam("client_id", kakaoRestKey)
                .queryParam("redirect_uri", kakaoRedirectUri)
                .queryParam("response_type", "code")
                .queryParam("scope", "profile_nickname");

        if (codeChallenge != null && !codeChallenge.isBlank()) {
            b.queryParam("code_challenge", codeChallenge)
                    .queryParam("code_challenge_method", "S256");
        }
        if (state != null && !state.isBlank()) {
            b.queryParam("state", state);
        }

        String url = b.encode().toUriString();
        return Map.of("url", url);
    }

    /** 카카오 콜백 (카카오 -> 우리 서버) */
    @GetMapping("/callback")
    public ResponseEntity<String> callback(@RequestParam String code,
                                           @RequestParam(required = false) String state,
                                           @RequestParam(required = false, name = "code_verifier") String codeVerifier) {
        Map<String, Object> token = oauth.exchangeCodeForToken(code, codeVerifier).block();
        if (token == null || token.get("access_token") == null) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("Failed to exchange token with Kakao");
        }
        String accessToken = token.get("access_token").toString();
        KakaoMe me = kakaoApi.me(accessToken);
        KakaoLoginResponse res = service.login(me);

        URI deep = UriComponentsBuilder.fromUriString("toktokggubi://oauth/kakao")
                .queryParam("message", res.message())
                .queryParam("userId", res.userId())
                .queryParam("token", res.token() != null ? res.token().accessToken() : null)
                .queryParam("signupToken", res.signupToken())
                .build(true).toUri();

        // Android용 intent:// 보조(패키지명 꼭 맞추기)
        String intentUrl =
                "intent://oauth/kakao" +
                        "#Intent;scheme=toktokggubi;package=com.technologia.toktokggubi;end";

        String html = """
            <!doctype html><html><head><meta charset="utf-8">
            <meta http-equiv="refresh" content="0; url=%s">
            <script>
              // 일부 브라우저에서 커스텀 스킴 자동 이동이 막히는 경우 intent를 보조로 시도
              setTimeout(function(){ location.href = '%s'; }, 150);
            </script>
            </head><body>
            <p>앱으로 이동 중… 이동하지 않으면 <a href="%s">여기</a>를 누르세요.</p>
            </body></html>
            """.formatted(deep.toString(), intentUrl, deep.toString());

        return ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.TEXT_HTML)
                .body(html);
    }
}
