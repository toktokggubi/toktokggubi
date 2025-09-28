package com.ssafy.toktokggubi.global.security.jwt;

import io.jsonwebtoken.Claims;
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

@Component
@Getter
public class JwtProvider {
    @Value("${jwt.secret}")
    private String secret;
    @Value("${jwt.issuer:toktokggubi}")
    private String issuer;
    @Value("${jwt.signup-exp-minutes:15}")
    private long signupExpMinutes;
    @Value("${jwt.access-exp-minutes:60}")
    private long accessExpMinutes;
    @Value("${jwt.refresh-exp-days:14}")
    private long refreshExpDays;

    private SecretKey key;

    @PostConstruct
    void init() {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    // ====== 발급 ======
    public String createSignupToken(Long userId) {
        Instant now = Instant.now();
        return Jwts.builder()
                .setIssuer(issuer)
                .setSubject("signup:" + userId)
                .claim("t", "signup")
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(now.plusSeconds(signupExpMinutes * 60)))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String createAccessToken(Long userId) {
        Instant now = Instant.now();
        return Jwts.builder()
                .setIssuer(issuer)
                .setSubject(String.valueOf(userId))
                .claim("t", "access")
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(now.plusSeconds(accessExpMinutes * 60)))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String createRefreshToken(Long userId) {
        Instant now = Instant.now();
        return Jwts.builder()
                .setIssuer(issuer)
                .setSubject(String.valueOf(userId))
                .claim("t", "refresh")
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(now.plusSeconds(refreshExpDays * 24 * 3600)))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    private Claims parse(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token).getBody();
    }

    public Long parseSignupUserId(String token) {
        Claims c = parse(token);
        if (!"signup".equals(c.get("t"))) throw new IllegalArgumentException("잘못된 토큰 타입");
        String sub = c.getSubject(); // signup:{id}
        if (sub == null || !sub.startsWith("signup:")) throw new IllegalArgumentException("잘못된 subject");
        return Long.valueOf(sub.substring("signup:".length()));
    }

    public Long parseAccessUserId(String token) {
        Claims c = parse(token);
        if (!"access".equals(c.get("t"))) throw new IllegalArgumentException("access 토큰 아님");
        return Long.valueOf(c.getSubject());
    }

    public Long parseRefreshUserId(String token) {
        Claims c = parse(token);
        if (!"refresh".equals(c.get("t"))) throw new IllegalArgumentException("refresh 토큰 아님");
        return Long.valueOf(c.getSubject());
    }
}
