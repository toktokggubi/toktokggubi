package com.ssafy.toktokggubi.global.security.token;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class TokenRevocationService {
    private final StringRedisTemplate redis;
    private static final String KEY_PREFIX = "auth:blacklist:";

    public void revoke(String accessToken, Duration ttl) {
        redis.opsForValue().set(KEY_PREFIX + accessToken, "1", ttl);
    }

    public boolean isRevoked(String accessToken) {
        return redis.hasKey(KEY_PREFIX + accessToken);
    }
}
