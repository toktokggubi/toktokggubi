package com.ssafy.toktokggubi.domain.push.controller;

import com.ssafy.toktokggubi.domain.push.service.FcmService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/push/test")
@Tag(name = "Push Test", description = "FCM 전송 테스트")
@RequiredArgsConstructor
public class PushController {

    private final FcmService fcmService;

    @Operation(summary = "단일 토큰으로 전송", description = "FCM 디바이스 토큰 1개에 전송합니다.")
    @PostMapping("/send-token")
    public ResponseEntity<?> sendToToken(@Valid @RequestBody SendTokenRequest req) throws Exception {
        boolean dryRun = Boolean.TRUE.equals(req.dryRun());
        String messageId = fcmService.sendToSingleToken(req.token(), req.title(), req.body(), dryRun);
        return ResponseEntity.ok(java.util.Map.of(
                "dryRun", dryRun,
                "messageId", messageId
        ));
    }

    /**
     * (A) 단일 토큰 전송
     */
    public record SendTokenRequest(
            @NotBlank String token,
            @NotBlank String title,
            @NotBlank String body,
            Boolean dryRun
    ) {
    }


}
