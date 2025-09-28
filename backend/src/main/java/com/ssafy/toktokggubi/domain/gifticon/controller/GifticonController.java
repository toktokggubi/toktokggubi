package com.ssafy.toktokggubi.domain.gifticon.controller;

import com.ssafy.toktokggubi.domain.gifticon.dto.response.GifticonCreateResponse;
import com.ssafy.toktokggubi.domain.gifticon.dto.response.GifticonListResponse;
import com.ssafy.toktokggubi.domain.gifticon.service.GifticonService;
import com.ssafy.toktokggubi.global.security.utils.SecurityUtils;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/wallet/gifticons")
@Tag(name = "기프티콘", description = "기프티콘 업로드/OCR")
public class GifticonController {

    private final GifticonService gifticonService;

    /**
     * 기프티콘 이미지 업로드 + OCR 파싱 + 저장
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<GifticonCreateResponse> upload(@RequestPart("file") MultipartFile file) throws Exception {
        Long userId = SecurityUtils.currentUserIdOrNull();
        if (userId == null) throw new IllegalStateException("인증 필요");
        return ResponseEntity.ok(gifticonService.createFromUpload(userId, file));
    }


    /**
     * 기프티콘 조회
     * - 프랜차이즈별:  /wallet/gifticons?franchiseId=10
     * - 사용가능만:              /wallet/gifticons?usable=true
     * - 최신순(기본):            /wallet/gifticons?sort=latest
     * - 만료임박순:              /wallet/gifticons?sort=expires
     * - 여러 조건 조합 가능
     */
    @GetMapping
    public ResponseEntity<GifticonListResponse> list(
            @RequestParam(value = "franchiseId", required = false) Long franchiseId,
            @RequestParam(value = "usable", required = false) Boolean usableOnly,
            @RequestParam(value = "sort", required = false, defaultValue = "latest") String sort
    ) {
        Long userId = SecurityUtils.currentUserIdOrNull();
        if (userId == null) throw new IllegalStateException("인증 필요");
        return ResponseEntity.ok(gifticonService.list(userId, franchiseId, usableOnly, sort));
    }

    /**
     * 기프티콘 삭제(수동) — 상태를 INACTIVE 로 변경
     */
    @DeleteMapping("/{gifticonId}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long gifticonId) {
        Long userId = SecurityUtils.currentUserIdOrNull();
        if (userId == null) throw new IllegalStateException("인증 필요");
        gifticonService.delete(userId, gifticonId);
        return ResponseEntity.ok(Map.of("message", "기프티콘이 삭제되었습니다"));
    }
}
