package com.ssafy.toktokggubi.global.ws;

import com.ssafy.toktokggubi.global.security.jwt.JwtProvider;
import com.ssafy.toktokggubi.global.security.token.TokenRevocationService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.security.Principal;
import java.util.Collections;
import java.util.Map;
import java.util.Optional;

@RequiredArgsConstructor
@Component
public class WsJwtHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtProvider jwtProvider;
    private final TokenRevocationService tokenRevocationService;

    @Override
    public boolean beforeHandshake(
            @NotNull ServerHttpRequest request,
            @NotNull ServerHttpResponse response,
            @NotNull WebSocketHandler wsHandler,
            @NotNull Map<String, Object> attributes
    ) {
        try {
            String auth = null;

            // 1) 헤더 Authorization: Bearer xxx
            if (request instanceof ServletServerHttpRequest servletReq) {
                HttpServletRequest http = servletReq.getServletRequest();
                auth = http.getHeader(HttpHeaders.AUTHORIZATION);
            }

            // 2) 쿼리파라미터 token=xxx 도 허용 (프론트 편의)
            if (auth == null || !auth.startsWith("Bearer ")) {
                var uri = request.getURI();
                var query = Optional.ofNullable(uri.getQuery()).orElse("");
                for (String kv : query.split("&")) {
                    var parts = kv.split("=");
                    if (parts.length == 2 && "token".equalsIgnoreCase(parts[0])) {
                        auth = "Bearer " + parts[1];
                        break;
                    }
                }
            }

            if (auth != null && auth.startsWith("Bearer ")) {
                String token = auth.substring(7);
                if (!tokenRevocationService.isRevoked(token)) {
                    Long userId = jwtProvider.parseAccessUserId(token);
                    Principal principal = new UsernamePasswordAuthenticationToken(
                            new User(String.valueOf(userId), "N/A", Collections.emptyList()),
                            token,
                            Collections.emptyList()
                    );
                    attributes.put("principal", principal);
                }
            }
        } catch (Exception ignored) {
        }
        return true;
    }

    @Override
    public void afterHandshake(
            @NotNull org.springframework.http.server.ServerHttpRequest request,
            @NotNull org.springframework.http.server.ServerHttpResponse response,
            @NotNull org.springframework.web.socket.WebSocketHandler wsHandler,
            Exception exception) {
    }
}


