package com.ssafy.toktokggubi.domain.push.service;

import com.google.firebase.messaging.*;
import com.ssafy.toktokggubi.domain.push.service.PushTokenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class FcmService {

    private static final int BATCH = 500;
    private final PushTokenService tokenService; // ✅ 토큰서비스로 위임

    public void sendToUser(long userId, String title, String body, String link) {
        List<String> tokens = tokenService.findTokensByUserIds(List.of(userId));
        sendInBatches(tokens, title, body, link, userId);
    }

    private void sendInBatches(List<String> tokens, String title, String body, String link, long userId) {
        if (tokens.isEmpty()) {
            log.info("[FCM] no active tokens for user {}", userId);
            return;
        }
        for (int i = 0; i < tokens.size(); i += BATCH) {
            List<String> part = tokens.subList(i, Math.min(i + BATCH, tokens.size()));
            sendOneBatch(part, title, body, link, userId);
        }
    }

    private void sendOneBatch(List<String> tokens, String title, String body, String link, long userId) {
        MulticastMessage message = MulticastMessage.builder()
                .putData("link", nz(link))
                .setWebpushConfig(WebpushConfig.builder()
                        .setNotification(WebpushNotification.builder().setTitle(title).setBody(body).build())
                        .setFcmOptions(WebpushFcmOptions.builder().setLink(link).build())
                        .build())
                .addAllTokens(tokens)
                .build();

        try {
            BatchResponse res = FirebaseMessaging.getInstance().sendEachForMulticast(message);
            if (res.getFailureCount() > 0) {
                List<String> toDisable = new ArrayList<>();
                for (int i = 0; i < res.getResponses().size(); i++) {
                    if (!res.getResponses().get(i).isSuccessful()) {
                        toDisable.add(tokens.get(i));
                    }
                }
                toDisable.forEach(tokenService::invalidate);
            }
        } catch (FirebaseMessagingException e) {
            log.error("[FCM] send error", e);
        }
    }

    private String nz(String s) { return (s == null) ? "" : s; }
}
