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

    public void sendToUser(Long userId, String title, String body) throws Exception {
        List<String> tokens = tokenService.findActiveTokensByUser(userId);
        if (tokens.isEmpty()) return;

        Notification noti = Notification.builder()
                .setTitle(title)
                .setBody(body)
                .build();

        MulticastMessage msg = MulticastMessage.builder()
                .addAllTokens(tokens)
                .setNotification(noti)     // ← data 없이 순수 알림
                .build();

        FirebaseMessaging.getInstance().sendEachForMulticast(msg);
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
    public String sendToSingleToken(String token, String title, String body, boolean dryRun) throws Exception {
        Notification noti = Notification.builder()
                .setTitle(title)
                .setBody(body)
                .build();

        Message msg = Message.builder()
                .setToken(token)
                .setNotification(noti)
                // (선택) 안드로이드 채널/우선순위
                .setAndroidConfig(AndroidConfig.builder()
                        .setPriority(AndroidConfig.Priority.HIGH)
                        .setNotification(AndroidNotification.builder()
                                .setChannelId("budget-alerts") // 앱에서 같은 id 채널 생성 필요
                                .build())
                        .build())
                // (선택) 웹푸시 링크
                .setWebpushConfig(WebpushConfig.builder()
                        .setNotification(WebpushNotification.builder()
                                .setTitle(title).setBody(body).build())
                        .setFcmOptions(WebpushFcmOptions.builder()
                                .setLink(linkOrEmpty(null))
                                .build())
                        .build())
                .build();

        return FirebaseMessaging.getInstance().send(msg, dryRun);
    }

    private String linkOrEmpty(String s) { return (s == null) ? "" : s; }

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
