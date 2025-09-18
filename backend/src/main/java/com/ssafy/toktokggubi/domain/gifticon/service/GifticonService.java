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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GifticonService {

    private final GifticonRepository gifticonRepository;
    private final FranchiseRepository franchiseRepository;
    private final UserRepository userRepository;
    private final OcrClient ocrClient;
    private final FileStorage fileStorage;

    @Transactional
    public GifticonCreateResponse createFromUpload(Long userId, MultipartFile file) throws Exception {
        // 1) 파일 저장
        var saved = fileStorage.saveGifticon(file);

        // 2) OCR
        String allText = ocrClient.extractText(file.getBytes());

        // 3) 파싱
        var parsed = GifticonTextParser.parse(allText);
        String brand = parsed.brand();
        String label = parsed.label();
        LocalDate expiresAt = parsed.expiresAt();

        // 4) 프랜차이즈 매칭 (없으면 신규 생성)
        Franchise franchise = null;
        if (brand != null && !brand.isBlank()) {
            franchise = franchiseRepository.findFirstByMerchantName(brand)
                    .orElseGet(() -> franchiseRepository.save(
                            Franchise.builder()
                                    .merchantName(brand) // 우리 스키마상 이름 컬럼이 merchantName
                                    .imageUrl(null)
                                    .build()
                    ));
        }

        // 5) 저장
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
