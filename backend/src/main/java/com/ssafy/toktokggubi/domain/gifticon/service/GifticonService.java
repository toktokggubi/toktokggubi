package com.ssafy.toktokggubi.domain.gifticon.service;

import com.ssafy.toktokggubi.domain.franchise.entity.Franchise;
import com.ssafy.toktokggubi.domain.franchise.repository.FranchiseRepository;
import com.ssafy.toktokggubi.domain.gifticon.dto.response.GifticonCreateResponse;
import com.ssafy.toktokggubi.domain.gifticon.dto.response.GifticonItemResponse;
import com.ssafy.toktokggubi.domain.gifticon.dto.response.GifticonListResponse;
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
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
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

    // 기프티콘 여부 힌트: 키워드 + 바코드 유사 패턴
    private static final Pattern BARCODE_LIKE = Pattern.compile("\\b\\d{10,}\\b"); // 10자리 이상 숫자
    private static final String[] GIFTICON_KEYWORDS = {
            "유효기간", "교환처", "교환권", "주문번호", "바코드", "쿠폰번호", "교환만료", "사용기간"
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
        // 1) OCR 실행
        String allText = ocrClient.extractText(file.getBytes());

        // 2) 기프티콘 여부 판정
        if (!looksLikeGifticon(allText)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "기프티콘 이미지로 인식되지 않았습니다. 이미지 전체가 보이도록 촬영/캡처 후 다시 시도해주세요."
            );
        }

        // 3) 파싱
        var parsed = GifticonTextParser.parse(allText);
        String brand = parsed.brand();   // 예: "배달의민족" (캐노니컬 표시명)
        String label = parsed.label();
        LocalDate expiresAt = parsed.expiresAt();

        // 4) 프랜차이즈 매칭(없으면 생성)
        Franchise franchise = null;
        if (brand != null && !brand.isBlank()) {
            franchise = franchiseRepository.findFirstByMerchantName(brand)
                    .orElseGet(() -> franchiseRepository.save(
                            Franchise.builder()
                                    .merchantName(brand)   // 프랜차이즈는 배달의민족으로 등록
                                    .imageUrl(null)
                                    .build()
                    ));
        }

        // 5) 파일 저장
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

    /**
     * 조회 파라미터
     * @param franchiseId  프랜차이즈(브랜드) 필터 (nullable)
     * @param usableOnly   사용 가능만 (null이면 무시)
     * @param sort         latest | expires (기본 latest)
     */
    public GifticonListResponse list(Long userId, Long franchiseId, Boolean usableOnly, String sort) {
        // 사용자 존재 체크
        userRepository.findById(userId).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));

        // 삭제(INACTIVE) 제외 기본셋
        List<Gifticon> all = gifticonRepository.findByUser_UserIdAndStatusNot(userId, GifticonStatus.INACTIVE);

        // 프랜차이즈 필터
        if (franchiseId != null) {
            all = all.stream()
                    .filter(g -> g.getFranchise() != null && franchiseId.equals(g.getFranchise().getFranchiseId()))
                    .toList();
        }

        // 사용 가능만: 상태 ACTIVE & (만료일 없음 or 오늘 이후)
        if (Boolean.TRUE.equals(usableOnly)) {
            LocalDate today = LocalDate.now();
            all = all.stream()
                    .filter(g -> g.getStatus() == GifticonStatus.ACTIVE
                            && (g.getExpiresAt() == null || !g.getExpiresAt().isBefore(today)))
                    .toList();
        }

        // 정렬
        Comparator<Gifticon> comp;
        if ("expires".equalsIgnoreCase(sort)) {
            LocalDate today = LocalDate.now();
            comp = Comparator
                    .comparing((Gifticon g) -> daysUntil(today, g.getExpiresAt()), Comparator.nullsLast(Long::compareTo))
                    .thenComparing(Gifticon::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder()));
        } else {
            comp = Comparator.comparing(Gifticon::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder()));
        }
        List<GifticonItemResponse> items = all.stream()
                .sorted(comp)
                .map(this::toItem)
                .toList();

        return new GifticonListResponse(items);
    }

    @Transactional
    public void delete(Long userId, Long gifticonId) {
        Gifticon g = gifticonRepository.findById(gifticonId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "기프티콘을 찾을 수 없습니다."));
        if (!g.getUser().getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "삭제 권한이 없습니다.");
        }
        // 물리삭제 대신 상태 전환
        g = g.toBuilder().status(GifticonStatus.INACTIVE).build();
        gifticonRepository.save(g);
    }

    /* ========================= 내부 ========================= */

    private GifticonItemResponse toItem(Gifticon g) {
        Long franchiseId = g.getFranchise() != null ? g.getFranchise().getFranchiseId() : null;
        String franchiseName = g.getFranchise() != null ? g.getFranchise().getMerchantName() : null;
        Long days = daysUntil(LocalDate.now(), g.getExpiresAt());
        return new GifticonItemResponse(
                g.getGifticonId(),
                g.getLabel(),
                franchiseId,
                franchiseName,
                g.getImageUrl(),
                g.getExpiresAt(),
                days,
                g.getStatus()
        );
    }

    private Long daysUntil(LocalDate from, LocalDate to) {
        if (to == null) return null;
        return ChronoUnit.DAYS.between(from, to);
    }
}
