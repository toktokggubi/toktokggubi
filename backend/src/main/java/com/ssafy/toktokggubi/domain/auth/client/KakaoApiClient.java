package com.ssafy.toktokggubi.domain.auth.client;

import com.ssafy.toktokggubi.domain.auth.dto.response.KakaoMe;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;


@Component
@RequiredArgsConstructor
public class KakaoApiClient {
    private final WebClient.Builder webClientBuilder;

    @Value("${kakao.api-base:https://kapi.kakao.com}")
    private String kakaoApiBase;

    public KakaoMe me(String accessToken) {
        return webClientBuilder.baseUrl(kakaoApiBase)
                .build()
                .get().uri("/v2/user/me")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .retrieve()
                .bodyToMono(KakaoMe.class)
                .block();
    }
}
