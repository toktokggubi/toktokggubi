package com.ssafy.toktokggubi.domain.gms.controller;

import com.ssafy.toktokggubi.domain.gms.service.GmsTextService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/internal/gms")
@RequiredArgsConstructor
@Tag(name = "gms ping", description = "gms API")
public class GmsProbeController {
    private final GmsTextService gms;

    @GetMapping("/ping")
    public Map<String,Object> ping() {
        long t0 = System.currentTimeMillis();
        String body = gms.locationRemainBody(10_000L, "카페", 7); // 아주 짧은 호출
        long ms = System.currentTimeMillis() - t0;
        return Map.of("ok", body != null && !body.isBlank(),
                "body", body,
                "elapsedMs", ms);
    }
}
