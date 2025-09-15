package com.ssafy.toktokggubi.domain.auth.service;

import com.ssafy.toktokggubi.domain.auth.dto.request.KakaoLoginRequest;
import com.ssafy.toktokggubi.domain.auth.dto.response.KakaoLoginResponse;
import com.ssafy.toktokggubi.domain.auth.dto.response.KakaoMe;
import com.ssafy.toktokggubi.domain.finance.service.FinanceLinkService;
import com.ssafy.toktokggubi.domain.user.entity.Gender;
import com.ssafy.toktokggubi.domain.user.entity.User;
import com.ssafy.toktokggubi.domain.user.entity.UserStatus;
import com.ssafy.toktokggubi.domain.user.repository.UserRepository;
import com.ssafy.toktokggubi.global.dto.response.TokenEnvelope;
import com.ssafy.toktokggubi.global.security.jwt.JwtProvider;
import com.ssafy.toktokggubi.global.security.token.RefreshTokenStore;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class KakaoAuthService {
    private final KakaoApiClient kakaoApiClient;
    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;
    private final RefreshTokenStore refreshStore;
    private final FinanceLinkService financeLinkService;

    @Transactional
    public KakaoLoginResponse login(KakaoLoginRequest req) {
        KakaoMe me = kakaoApiClient.me(req.accessToken());
        Long kakaoId = me.id();

        String email, nickname;
        if (me.kakao_account() != null && me.kakao_account().get("email") != null) {
            email = me.kakao_account().get("email").toString();
        } else {
            email = null;
        }
        if (me.properties() != null && me.properties().get("nickname") != null) {
            nickname = me.properties().get("nickname").toString();
        } else {
            nickname = null;
        }

        User u = userRepository.findByKakaoSub(String.valueOf(kakaoId)).orElseGet(() ->
                userRepository.save(User.builder()
                        .email(email != null ? email : ("kakao-" + kakaoId + "@toktokggubi.com"))
                        .password(null)
                        .nickname(nickname != null ? nickname : "사용자") // 스키마 NOT NULL 때문에 임시값
                        .gender(Gender.M) // 스키마 NOT NULL 때문에 임시값
                        .kakaoSub(String.valueOf(kakaoId))
                        .status(UserStatus.INACTIVE)
                        .build())
        );

        financeLinkService.ensureFinanceUserKey(u);

        String access = jwtProvider.createAccessToken(u.getUserId(), u.getEmail());
        String refresh = jwtProvider.createRefreshToken(u.getUserId());
        refreshStore.save(u.getUserId(), refresh, Duration.ofDays(jwtProvider.getRefreshExpDays()));

        TokenEnvelope token = TokenEnvelope.builder()
                .accessToken(access)
                .expiresIn(jwtProvider.getAccessExpMinutes()*60)
                .refreshToken(refresh)
                .refreshExpiresIn(jwtProvider.getRefreshExpDays()*24L*3600L)
                .tokenType("Bearer")
                .build();

        return KakaoLoginResponse.builder()
                .message("카카오 로그인 완료")
                .userId(u.getUserId())
                .token(token)
                .build();
    }
}
