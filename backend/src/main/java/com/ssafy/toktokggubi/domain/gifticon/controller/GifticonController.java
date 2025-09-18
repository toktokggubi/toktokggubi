package com.ssafy.toktokggubi.domain.gifticon.controller;

import com.ssafy.toktokggubi.domain.gifticon.dto.response.GifticonCreateResponse;
import com.ssafy.toktokggubi.domain.gifticon.service.GifticonService;
import com.ssafy.toktokggubi.global.security.utils.SecurityUtils;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/wallet/gifticons")
@Tag(name = "기프티콘", description = "기프티콘 업로드/OCR")
public class GifticonController {

    private final GifticonService gifticonService;

    /** 기프티콘 이미지 업로드 + OCR 파싱 + 저장 */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<GifticonCreateResponse> upload(@RequestPart("file") MultipartFile file) throws Exception {
        Long userId = SecurityUtils.currentUserIdOrNull();
        if (userId == null) throw new IllegalStateException("인증 필요");
        return ResponseEntity.ok(gifticonService.createFromUpload(userId, file));
    }
}
