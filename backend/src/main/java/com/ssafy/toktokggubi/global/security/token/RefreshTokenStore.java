package com.ssafy.toktokggubi.global.security.token;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RefreshTokenStore {

    private static final String KEY_PREFIX = "auth:refresh:"; // key = auth:refresh:<userId>
    private final StringRedisTemplate redis;

    /**
     * 리프레시 토큰 저장 (TTL 포함)
     */
    public void save(Long userId, String refreshToken, Duration ttl) {
        String key = KEY_PREFIX + userId;
        redis.opsForValue().set(key, refreshToken, ttl);
    }

    /**
     * 리프레시 토큰 조회
     */
    public Optional<String> get(Long userId) {
        String key = KEY_PREFIX + userId;
        return Optional.ofNullable(redis.opsForValue().get(key));
    }

    /**
     * 리프레시 토큰 삭제(로그아웃/강제 만료 등)
     */
    public void delete(Long userId) {
        String key = KEY_PREFIX + userId;
        redis.delete(key);
    }
}
