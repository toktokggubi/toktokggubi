package com.ssafy.toktokggubi.domain.wallet.service;

import com.ssafy.toktokggubi.domain.push.service.FcmService;
import com.ssafy.toktokggubi.domain.wallet.dto.response.BestCardsResponse;
import com.ssafy.toktokggubi.domain.wallet.dto.response.CardBenefitsResponse;
import com.ssafy.toktokggubi.domain.wallet.dto.response.CardsListResponse;
import com.ssafy.toktokggubi.domain.wallet.dto.request.PaymentRequest;
import com.ssafy.toktokggubi.domain.wallet.dto.response.PaymentResponse;
import com.ssafy.toktokggubi.domain.card.entity.CardProductBenefit;
import com.ssafy.toktokggubi.domain.card.repository.CardProductBenefitRepository;
import com.ssafy.toktokggubi.domain.merchant.entity.Merchant;
import com.ssafy.toktokggubi.domain.merchant.repository.MerchantRepository;
import com.ssafy.toktokggubi.domain.transaction.entity.CardStatus;
import com.ssafy.toktokggubi.domain.transaction.entity.CardTransaction;
import com.ssafy.toktokggubi.domain.transaction.repository.CardTransactionRepository;
import com.ssafy.toktokggubi.domain.wallet.entity.UserCard;
import com.ssafy.toktokggubi.domain.wallet.event.TxApprovedEvent;
import com.ssafy.toktokggubi.domain.wallet.repository.UserCardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

import static org.springframework.http.HttpStatus.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WalletService {

    private final UserCardRepository userCardRepository;
    private final CardProductBenefitRepository cardProductBenefitRepository;
    private final MerchantRepository merchantRepository;
    private final CardTransactionRepository cardTransactionRepository;
    private final ApplicationEventPublisher publisher;

    // ========== 조회 ==========

    public CardsListResponse getUserCards(Long userId) {
        var cards = userCardRepository.findByUser_UserIdAndIsActiveTrue(userId).stream()
                .map(this::toCardSummary)
                .toList();
        return new CardsListResponse(cards);
    }

    public CardBenefitsResponse getCardBenefits(Long userId, Long userCardId) {
        UserCard uc = userCardRepository.findByUser_UserIdAndUserCardId(userId, userCardId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "카드를 찾을 수 없습니다."));
        var items = cardProductBenefitRepository.findByCardProduct_CardUniqueNo(uc.getCardProduct().getCardUniqueNo())
                .stream()
                .map(b -> new CardBenefitsResponse.BenefitItem(
                        b.getFranchise().getFranchiseId(),
                        b.getFranchise().getFranchiseName(),   // Franchise 엔티티에 상호명 필드가 있다고 가정
                        b.getDiscountRate()
                ))
                .toList();
        return new CardBenefitsResponse(uc.getUserCardId(), items);
    }

    public BestCardsResponse rankBestCards(Long userId, String merchantName, Long amountOpt) {
        // 1) 가맹점은 "있으면" 쓰고, 없으면 null
        Merchant merchant = merchantRepository.findFirstByMerchantName(merchantName).orElse(null);
        Long franchiseId = (merchant != null && merchant.getFranchise() != null)
                ? merchant.getFranchise().getFranchiseId()
                : null;

        // 2) 사용자 보유 카드 → 혜택 계산 (가맹점 없으면 모두 0%)
        var offersStream = userCardRepository.findByUser_UserIdAndIsActiveTrue(userId).stream()
                .map(uc -> {
                    BigDecimal rate = BigDecimal.ZERO;
                    if (franchiseId != null) {
                        rate = cardProductBenefitRepository
                                .findByCardProduct_CardUniqueNoAndFranchise_FranchiseId(
                                        uc.getCardProduct().getCardUniqueNo(), franchiseId)
                                .map(CardProductBenefit::getDiscountRate)
                                .orElse(BigDecimal.ZERO);
                    }
                    Long estimatedFinal = (amountOpt == null) ? null : applyDiscount(amountOpt, rate);

                    return new BestCardsResponse.CardOffer(
                            uc.getUserCardId(),
                            uc.getCardProduct().getCardIssuer().getCardIssuerName(),
                            uc.getCardProduct().getCardName(),
                            uc.getCardProduct().getCardTypeName().name(),
                            rate,
                            estimatedFinal
                    );
                });

        // 3) 가맹점이 있을 때만 혜택율 내림차순 정렬
        var offers = (franchiseId != null)
                ? offersStream
                .sorted(Comparator.comparing(
                        (BestCardsResponse.CardOffer o) ->
                                o.discountRate() == null ? BigDecimal.ZERO : o.discountRate()
                ).reversed())
                .toList()
                : offersStream.toList(); // 가맹점 없으면 기본(조회 순서) 그대로

        // 4) 응답용 가맹점 정보(없으면 id=null, 이름은 요청값 그대로)
        String respMerchantName = (merchant != null) ? merchant.getMerchantName() : merchantName;
        Long respMerchantId = (merchant != null) ? merchant.getMerchantId() : null;

        return new BestCardsResponse(respMerchantName, respMerchantId, amountOpt, offers);
    }


    // ========== 결제 ==========

    @Transactional
    public PaymentResponse pay(Long userId, PaymentRequest req) {
        if (req.amount() == null || req.amount() <= 0) {
            throw new ResponseStatusException(BAD_REQUEST, "결제 금액이 올바르지 않습니다.");
        }

        UserCard uc = userCardRepository.findByUser_UserIdAndUserCardId(userId, req.userCardId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "카드를 찾을 수 없습니다."));

        Merchant merchant = resolveMerchant(req.merchantId(), req.merchantName());

        // 혜택 조회
        BigDecimal discountRate = cardProductBenefitRepository
                .findByCardProduct_CardUniqueNoAndFranchise_FranchiseId(
                        uc.getCardProduct().getCardUniqueNo(),
                        merchant.getFranchise().getFranchiseId()
                )
                .map(CardProductBenefit::getDiscountRate)
                .orElse(BigDecimal.ZERO);

        Long discountAmount = calcDiscountAmount(req.amount(), discountRate);
        Long finalAmount = req.amount() - discountAmount;

        // 트랜잭션 저장
        String txnId = genTxnId();
        LocalDateTime now = LocalDateTime.now();
        String ymd = now.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String hms = now.format(DateTimeFormatter.ofPattern("HHmmss"));

        CardTransaction txn = CardTransaction.builder()
                .transactionUniqueNo(txnId)
                .user(uc.getUser())
                .userCard(uc)
                .merchant(merchant)
                .cardStatus(CardStatus.APPROVED)
                .transactionYmd(ymd)
                .transactionHms(hms)
                .paymentBalance(finalAmount)
                .build();

        cardTransactionRepository.save(txn);

        publisher.publishEvent(new TxApprovedEvent(txn.getTransactionUniqueNo()));

        return new PaymentResponse(
                txnId,
                txn.getCardStatus().name(),
                uc.getUserCardId(),
                merchant.getMerchantId(),
                merchant.getMerchantName(),
                req.amount(),
                discountRate,
                discountAmount,
                finalAmount,
                ymd,
                hms,
                txn.getCreatedAt()
        );

    }

    // ========== 내부 유틸 ==========

    private CardsListResponse.CardSummary toCardSummary(UserCard uc) {
        var cp = uc.getCardProduct();
        var issuer = cp.getCardIssuer();
        return new CardsListResponse.CardSummary(
                uc.getUserCardId(),
                issuer.getCardIssuerName(),
                cp.getCardName(),
                cp.getCardTypeName().name(),
                mask(uc.getCardNo()),
                Boolean.TRUE.equals(uc.getIsActive()),
                cp.getImageUrl()
        );
    }

    private String mask(String cardNo) {
        if (cardNo == null || cardNo.length() < 4) return "****";
        String last4 = cardNo.substring(cardNo.length() - 4);
        return "****-****-****-" + last4;
    }

    private Merchant resolveMerchant(Long merchantId, String merchantName) {
        if (merchantId != null) {
            return merchantRepository.findById(merchantId)
                    .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "가맹점을 찾을 수 없습니다(id=" + merchantId + ")"));
        }
        if (merchantName != null && !merchantName.isBlank()) {
            return merchantRepository.findFirstByMerchantName(merchantName)
                    .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "가맹점을 찾을 수 없습니다(name=" + merchantName + ")"));
        }
        throw new ResponseStatusException(BAD_REQUEST, "가맹점 식별 정보가 필요합니다(merchantId 또는 merchantName).");
    }

    private Long calcDiscountAmount(Long amount, BigDecimal ratePct) {
        if (ratePct == null || ratePct.signum() <= 0) return 0L;
        // amount * rate / 100 -> 원단위 내림
        BigDecimal amt = BigDecimal.valueOf(amount);
        BigDecimal discount = amt.multiply(ratePct).divide(BigDecimal.valueOf(100), 0, RoundingMode.DOWN);
        return discount.longValue();
    }

    private Long applyDiscount(Long amount, BigDecimal ratePct) {
        return amount - calcDiscountAmount(amount, ratePct);
    }

    private String genTxnId() {
        // 32자 UUID(대시 제거). DB 길이(40) 이내
        return UUID.randomUUID().toString().replace("-", "");
    }
}
