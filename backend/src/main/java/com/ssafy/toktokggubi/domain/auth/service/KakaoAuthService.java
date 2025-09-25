package com.ssafy.toktokggubi.domain.auth.service;

import com.ssafy.toktokggubi.domain.auth.client.KakaoApiClient;
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

    private TokenEnvelope issueTokens(Long userId) {
        String access = jwtProvider.createAccessToken(userId);
        String refresh = jwtProvider.createRefreshToken(userId);
        refreshStore.save(userId, refresh, Duration.ofDays(jwtProvider.getRefreshExpDays()));
        return TokenEnvelope.builder()
                .accessToken(access)
                .expiresIn(jwtProvider.getAccessExpMinutes() * 60)
                .refreshToken(refresh)
                .refreshExpiresIn(jwtProvider.getRefreshExpDays() * 24L * 3600L)
                .tokenType("Bearer")
                .build();
    }

    @Transactional
    public KakaoLoginResponse login(KakaoMe me) {
        Long kakaoId = me.id();

        String email = (me.kakao_account() != null && me.kakao_account().get("email") != null)
                ? me.kakao_account().get("email").toString() : null;
        String nickname = (me.properties() != null && me.properties().get("nickname") != null)
                ? me.properties().get("nickname").toString() : null;

        User user = userRepository.findByKakaoSub(String.valueOf(kakaoId)).orElse(null);

        if (user == null) {
            user = userRepository.save(User.builder()
                    .email(email != null ? email : ("kakao-" + kakaoId + "@toktokggubi.com"))
                    .password(null)
                    .nickname(nickname != null ? nickname : "사용자")
                    .gender(Gender.M)
                    .kakaoSub(String.valueOf(kakaoId))
                    .status(UserStatus.INACTIVE)
                    .build());
        } else if (user.getStatus() == UserStatus.WITHDRAWN) {
            user = userRepository.save(user.toBuilder()
                    .status(UserStatus.INACTIVE)
                    .email(email != null ? email : user.getEmail())
                    .nickname(nickname != null ? nickname : user.getNickname())
                    .build());
        }

        financeLinkService.ensureFinanceUserKey(user);

        if (user.getStatus() == UserStatus.ACTIVE) {
            TokenEnvelope token = issueTokens(user.getUserId());
            return KakaoLoginResponse.builder()
                    .message("카카오 로그인 완료")
                    .userId(user.getUserId())
                    .token(token)
                    .build();
        } else {
            String signupToken = jwtProvider.createSignupToken(user.getUserId());
            return KakaoLoginResponse.builder()
                    .message("카카오 로그인 성공. 프로필 작성 후 완료하세요.")
                    .userId(user.getUserId())
                    .signupToken(signupToken)
                    .build();
        }
    }
}
