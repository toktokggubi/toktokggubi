package com.ssafy.toktokggubi.domain.wallet.controller;

import com.ssafy.toktokggubi.domain.wallet.dto.response.BestCardsResponse;
import com.ssafy.toktokggubi.domain.wallet.dto.response.CardBenefitsResponse;
import com.ssafy.toktokggubi.domain.wallet.dto.response.CardsListResponse;
import com.ssafy.toktokggubi.domain.wallet.dto.request.PaymentRequest;
import com.ssafy.toktokggubi.domain.wallet.dto.response.PaymentResponse;
import com.ssafy.toktokggubi.domain.wallet.service.WalletService;
import com.ssafy.toktokggubi.global.security.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/wallet")
public class WalletController {

    private final WalletService walletService;

    /** 사용자 계정에 등록된 카드 목록 */
    @GetMapping("/cards")
    public ResponseEntity<CardsListResponse> getCards() {
        Long userId = SecurityUtils.currentUserIdOrNull();
        if (userId == null) throw new IllegalStateException("인증 필요");
        return ResponseEntity.ok(walletService.getUserCards(userId));
    }

    /** 각 카드별 혜택 리스트 */
    @GetMapping("/cards/{userCardId}/benefits")
    public ResponseEntity<CardBenefitsResponse> getCardBenefits(
            @PathVariable Long userCardId
    ) {
        Long userId = SecurityUtils.currentUserIdOrNull();
        if (userId == null) throw new IllegalStateException("인증 필요");
        return ResponseEntity.ok(walletService.getCardBenefits(userId, userCardId));
    }

    /**
     * 특정 가맹점에서 사용자 카드 중 혜택이 좋은 순으로 반환
     * 프론트에서 merchantName 으로 전달. amount(원) 를 주면 예상 결제금액도 계산
     */
    @GetMapping("/cards/best")
    public ResponseEntity<BestCardsResponse> getBestCardsForMerchant(
            @RequestParam String merchantName,
            @RequestParam(required = false) Long amount
    ) {
        Long userId = SecurityUtils.currentUserIdOrNull();
        if (userId == null) throw new IllegalStateException("인증 필요");
        return ResponseEntity.ok(walletService.rankBestCards(userId, merchantName, amount));
    }

    /**
     * 결제 (QR 인식 결과 사용)
     * QR: merchantId/merchantName/amount 포함 가능
     * 카드 혜택(프랜차이즈 할인)이 있으면 할인 후 금액으로 결제
     */
    @PostMapping("/payments")
    public ResponseEntity<PaymentResponse> pay(
            @RequestBody PaymentRequest request
    ) {
        Long userId = SecurityUtils.currentUserIdOrNull();
        if (userId == null) throw new IllegalStateException("인증 필요");
        return ResponseEntity.ok(walletService.pay(userId, request));
    }
}