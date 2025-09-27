package com.ssafy.toktokggubi.domain.user.service;

import com.ssafy.toktokggubi.domain.auth.dto.request.RefreshRequest;
import com.ssafy.toktokggubi.domain.auth.dto.response.RefreshResponse;
import com.ssafy.toktokggubi.domain.finance.service.FinanceLinkService;
import com.ssafy.toktokggubi.domain.user.dto.request.*;
import com.ssafy.toktokggubi.domain.user.dto.response.*;
import com.ssafy.toktokggubi.domain.user.entity.Gender;
import com.ssafy.toktokggubi.domain.user.entity.User;
import com.ssafy.toktokggubi.domain.user.entity.UserStatus;
import com.ssafy.toktokggubi.domain.user.repository.UserRepository;
import com.ssafy.toktokggubi.global.dto.response.TokenEnvelope;
import com.ssafy.toktokggubi.global.security.jwt.JwtProvider;
import com.ssafy.toktokggubi.global.security.token.RefreshTokenStore;
import com.ssafy.toktokggubi.global.security.token.TokenRevocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class UserAuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final RefreshTokenStore refreshStore;
    private final TokenRevocationService tokenRevoke;
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
    public SignupEmailResponse signup(SignupEmailRequest req) {
        if (userRepository.existsByEmail(req.email()))
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");

        User saved = userRepository.save(User.builder()
                .email(req.email())
                .password(passwordEncoder.encode(req.password()))
                .nickname("사용자")
                .gender(Gender.M)
                .status(UserStatus.INACTIVE)
                .build());

        financeLinkService.ensureFinanceUserKey(saved);

        String signupToken = jwtProvider.createSignupToken(saved.getUserId());

        return SignupEmailResponse.builder()
                .signupToken(signupToken)
                .message("회원 가입 시작. 프로필 작성 후 완료")
                .build();
    }

    @Transactional
    public TokenEnvelope createProfile(Long userId, ProfileCreateRequest req) {
        User u = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다."));
        userRepository.save(u.toBuilder()
                .nickname(req.nickname())
                .gender(req.gender())
                .ageGroup(req.ageGroup())
                .jobTitle(req.jobTitle())
                .monthlyIncome(req.monthlyIncome())
                .status(UserStatus.ACTIVE)
                .build());
        return issueTokens(userId);
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginEmailRequest req) {
        User u = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new BadCredentialsException("이메일 또는 비밀번호가 올바르지 않습니다."));
        if (u.getStatus() != UserStatus.ACTIVE)
            throw new BadCredentialsException("활성화되지 않은 계정입니다.");
        if (u.getPassword() == null || !passwordEncoder.matches(req.password(), u.getPassword()))
            throw new BadCredentialsException("이메일 또는 비밀번호가 올바르지 않습니다.");
        TokenEnvelope tok = issueTokens(u.getUserId());
        return LoginResponse.builder().message("로그인 완료").userId(u.getUserId()).token(tok).build();
    }

    @Transactional
    public RefreshResponse refresh(RefreshRequest req) {
        Long userId = jwtProvider.parseRefreshUserId(req.refreshToken());
        String stored = refreshStore.get(userId)
                .orElseThrow(() -> new BadCredentialsException("리프레시 토큰이 없습니다."));
        if (!stored.equals(req.refreshToken()))
            throw new BadCredentialsException("리프레시 토큰이 일치하지 않습니다.");
        TokenEnvelope tok = issueTokens(userId);
        return new RefreshResponse(tok);
    }

    @Transactional
    public void logout(Long userId, String accessToken) {
        refreshStore.delete(userId);
        if (accessToken != null) {
            tokenRevoke.revoke(accessToken, Duration.ofMinutes(jwtProvider.getAccessExpMinutes()));
        }
    }

    @Transactional(readOnly = true)
    public void resetPasswordSendMail(PasswordResetRequest req) {
        userRepository.findByEmail(req.email())
                .orElseThrow(() -> new IllegalArgumentException("가입되지 않은 이메일입니다."));
        // TODO: reset 토큰 생성/저장/메일 발송
    }

    @Transactional
    public void changePassword(Long userId, PasswordChangeRequest req) {
        User u = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다."));
        if (u.getPassword() == null || !passwordEncoder.matches(req.currentPassword(), u.getPassword()))
            throw new BadCredentialsException("현재 비밀번호가 올바르지 않습니다.");
        userRepository.save(u.toBuilder().password(passwordEncoder.encode(req.newPassword())).build());
    }

    @Transactional
    public void deleteAccount(Long userId) {
        User u = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다."));
        if (u.getStatus() == UserStatus.WITHDRAWN) return;
        userRepository.save(u.toBuilder().status(UserStatus.WITHDRAWN).build());
    }
}
