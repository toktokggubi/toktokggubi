package com.ssafy.toktokggubi.domain.push.service;

import com.ssafy.toktokggubi.domain.notification.entity.DevicePlatform;
import com.ssafy.toktokggubi.domain.push.entity.PushToken;
import com.ssafy.toktokggubi.domain.push.repository.DevicePushTokenRepository;
import com.ssafy.toktokggubi.domain.user.entity.User;
import com.ssafy.toktokggubi.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class PushTokenService {

    private final DevicePushTokenRepository repo;
    private final UserRepository userRepo;

    /** 토큰 등록 (존재하면 활성화/소유자 갱신, 없으면 새로 저장) */
    public void saveToken(Long userId, String token) {
        Objects.requireNonNull(userId, "userId is null");
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("token is blank");
        }

        User user = userRepo.findById(userId).orElseThrow();

        repo.findByToken(token).ifPresentOrElse(existing -> {
            if (!Boolean.TRUE.equals(existing.getIsActive())) {
                existing.activate();
            }
            if (!existing.getUser().getUserId().equals(userId)) {
                existing.changeOwner(user); //  도메인 메서드 사용
            }
        }, () -> {
            repo.save(PushToken.builder()
                    .user(user)
                    .platform(DevicePlatform.FCM) //  기본값 FCM
                    .token(token)
                    .isActive(true)
                    .build());
        });
    }

    /** 특정 사용자 ID 목록으로 활성화된 토큰 조회 */

    public List<String> findTokensByUserIds(Collection<Long> userIds) {
        return repo.findByUser_UserIdInAndIsActiveTrue(userIds).stream()
                .map(PushToken::getToken)
                .toList();
    }

    /** 서버 내부 청소용(소유자 무관) */
    public void invalidate(String token) {
        repo.findByToken(token).ifPresent(PushToken::deactivate);
    }

    /** 소유자 검증 후 단일 토큰 비활성화 */
    public void invalidateOwned(Long userId, String token) {
        repo.findByTokenAndUser_UserId(token, userId).ifPresent(PushToken::deactivate);
    }

    /** 내 모든 기기 토큰 비활성화 */
    public void invalidateAllOwned(Long userId) {
        repo.findByUser_UserIdAndIsActiveTrue(userId)
                .forEach(PushToken::deactivate);
    }
}
