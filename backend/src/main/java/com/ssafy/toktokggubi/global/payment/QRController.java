package com.ssafy.toktokggubi.global.payment;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/qr")
@Tag(name = "QR", description = "QR 생성 API")
public class QRController {

    @GetMapping(value = "/payment", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> qr(
            @RequestParam String merchantName,
            @RequestParam long amount,
            @RequestParam(defaultValue = "320") int size
    ) throws Exception {
        String json = String.format("{\"merchantName\":\"%s\",\"amount\":%d}", merchantName, amount);
        byte[] png = QR.pngFor(json, size);

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                // 브라우저가 다운로드 받게 하려면 아래 헤더 추가
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"qr.png\"")
                .body(png);
    }
}
