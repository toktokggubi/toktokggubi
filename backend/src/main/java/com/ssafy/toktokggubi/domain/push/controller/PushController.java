package com.ssafy.toktokggubi.domain.push.controller;

import com.ssafy.toktokggubi.domain.push.service.FcmService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Schema;
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

    /** (A) 단일 토큰 전송 */
    public record SendTokenRequest(
            @NotBlank String token,
            @NotBlank String title,
            @NotBlank String body,
            Boolean dryRun
    ) {}

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

    /** (B) 유저ID 기반 다중 토큰 전송 */
    public record SendUserRequest(
            @Schema(description = "유저ID", example = "5")
            @NotBlank String userId,  // 필요 시 Long으로 변경
            @Schema(description = "알림 제목", example = "예산 80% 임계")
            @NotBlank String title,
            @Schema(description = "알림 본문", example = "이달 예산 150,000원 중 120,000원 사용 (80.0%) · 30,000원 남음")
            @NotBlank String body,
            @Schema(description = "선택 링크(웹푸시/딥링크)", example = "toktokggubi://budget")
            String link,
            @Schema(description = "dryRun 여부", example = "true")
            Boolean dryRun
    ) {}



}
