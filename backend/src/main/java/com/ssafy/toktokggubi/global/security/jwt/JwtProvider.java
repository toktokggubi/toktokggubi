package com.ssafy.toktokggubi.global.security.jwt;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Objects;

@Component
@Getter
public class JwtProvider {
    @Value("${jwt.secret}") private String secret;
    @Value("${jwt.issuer:toktokggubi}") private String issuer;
    @Value("${jwt.access-exp-minutes:60}") private long accessExpMinutes;
    @Value("${jwt.refresh-exp-days:14}") private long refreshExpDays;

    private SecretKey key;

    @PostConstruct
    void init() { this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)); }

    public String createAccessToken(Long userId) {
        return createAccessToken(userId, null);
    }

    public String createAccessToken(Long userId, String email) {
        Instant now = Instant.now();
        var builder = Jwts.builder()
                .setIssuer(issuer)
                .setSubject(String.valueOf(userId))
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(now.plusSeconds(accessExpMinutes * 60)))
                .signWith(key, SignatureAlgorithm.HS256);
        if (email != null) builder.claim("email", email);
        return builder.compact();
    }

    public String createRefreshToken(Long userId) {
        Instant now = Instant.now();
        return Jwts.builder()
                .setIssuer(issuer)
                .setSubject(String.valueOf(userId))
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(now.plusSeconds(refreshExpDays * 24 * 3600)))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Long parseUserId(String token) {
        var claims = Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token).getBody();
        String sub = claims.getSubject();
        if (sub != null && sub.startsWith("refresh:")) {
            sub = sub.substring("refresh:".length());
        }
        return Long.valueOf(Objects.requireNonNull(sub));
    }
}
