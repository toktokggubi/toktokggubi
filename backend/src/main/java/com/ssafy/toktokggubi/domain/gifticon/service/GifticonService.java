package com.ssafy.toktokggubi.domain.gifticon.service;

import com.ssafy.toktokggubi.domain.franchise.entity.Franchise;
import com.ssafy.toktokggubi.domain.franchise.repository.FranchiseRepository;
import com.ssafy.toktokggubi.domain.gifticon.dto.response.GifticonCreateResponse;
import com.ssafy.toktokggubi.domain.gifticon.entity.Gifticon;
import com.ssafy.toktokggubi.domain.gifticon.entity.GifticonStatus;
import com.ssafy.toktokggubi.domain.gifticon.repository.GifticonRepository;
import com.ssafy.toktokggubi.domain.user.entity.User;
import com.ssafy.toktokggubi.domain.user.repository.UserRepository;
import com.ssafy.toktokggubi.global.file.FileStorage;
import com.ssafy.toktokggubi.global.ocr.OcrClient;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GifticonService {

    private final GifticonRepository gifticonRepository;
    private final FranchiseRepository franchiseRepository;
    private final UserRepository userRepository;
    private final OcrClient ocrClient;
    private final FileStorage fileStorage;

    // 바코드/주문번호 등 기프티콘에서 흔히 보이는 패턴(1개 이상 매칭되면 기프티콘으로 간주)
    private static final Pattern BARCODE_LIKE = Pattern.compile("\\b\\d{10,}\\b"); // 10자리 이상 숫자
    private static final String[] GIFTICON_KEYWORDS = {
            "유효기간", "교환처", "교환권", "주문번호", "바코드", "쿠폰번호", "교환만료"
    };

    private boolean looksLikeGifticon(String text) {
        if (text == null || text.isBlank()) return false;
        int hit = 0;
        for (String kw : GIFTICON_KEYWORDS) {
            if (text.contains(kw)) { hit++; }
        }
        if (BARCODE_LIKE.matcher(text.replaceAll("\\s+", "")).find()) { hit++; }
        return hit >= 2; // 키워드+바코드 유사 패턴 2점 이상이면 통과
    }

    @Transactional
    public GifticonCreateResponse createFromUpload(Long userId, MultipartFile file) throws Exception {
        // 1) 먼저 OCR
        String allText = ocrClient.extractText(file.getBytes());

        // 2) 기프티콘 여부 판정(판정 실패 시 저장도 하지 않음)
        if (!looksLikeGifticon(allText)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "기프티콘 이미지로 인식되지 않았습니다. 이미지 전체가 보이도록 촬영/캡처 후 다시 시도해주세요."
            );
        }

        // 3) 파싱(브랜드/라벨/만료일) — 라벨은 OCR 그대로(한글 유지)
        var parsed = GifticonTextParser.parse(allText);
        String brand = parsed.brand();         // ex) 크리스피크림
        String label = parsed.label();         // ex) 오리지널 글레이즈드 하프더즌
        LocalDate expiresAt = parsed.expiresAt();

        // 4) 프랜차이즈 매칭(없으면 생성)
        Franchise franchise = null;
        if (brand != null && !brand.isBlank()) {
            franchise = franchiseRepository.findFirstByMerchantName(brand)
                    .orElseGet(() -> franchiseRepository.save(
                            Franchise.builder()
                                    .merchantName(brand) // 우리 스키마 컬럼명
                                    .imageUrl(null)
                                    .build()
                    ));
        }

        // 5) 파일 저장 (검증 끝난 후에 저장)
        var saved = fileStorage.saveGifticon(file);

        // 6) 엔티티 저장
        User user = userRepository.findById(userId).orElseThrow();
        Gifticon entity = Gifticon.builder()
                .user(user)
                .franchise(franchise)
                .label(label != null ? label : (brand != null ? brand : "기프티콘"))
                .imageUrl(saved.url())
                .expiresAt(expiresAt)
                .status(GifticonStatus.ACTIVE)
                .build();

        gifticonRepository.save(entity);

        return new GifticonCreateResponse(
                entity.getGifticonId(),
                entity.getLabel(),
                brand,
                franchise != null ? franchise.getFranchiseId() : null,
                franchise != null ? franchise.getMerchantName() : null,
                entity.getExpiresAt(),
                entity.getImageUrl(),
                entity.getStatus(),
                allText
        );
    }
}
