// CategoryLocationController.java
package com.ssafy.toktokggubi.domain.push.controller;

import com.ssafy.toktokggubi.domain.push.dto.ThresholdCheckResponse;
import com.ssafy.toktokggubi.domain.push.service.CategoryLocationService;
import com.ssafy.toktokggubi.global.security.utils.SecurityUtils;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/push")
@Tag(name = "카테고리 방문 알림", description = "카테고리 방문 시 남은 예산(초과까지)을 알림")
@RequiredArgsConstructor
@Validated
public class CategoryLocationController {

    private final CategoryLocationService service;

    @PostMapping("/location")
    public ResponseEntity<ThresholdCheckResponse> notifyVisit(
            @RequestParam("categoryId") @NotNull Long categoryId
    ) throws Exception {

        Long userId = SecurityUtils.currentUserIdOrNull(); // 프로젝트 유틸 그대로 사용
        ThresholdCheckResponse resp = service.notifyRemainForCategory(userId, categoryId);
        return ResponseEntity.ok(resp);
    }
}
