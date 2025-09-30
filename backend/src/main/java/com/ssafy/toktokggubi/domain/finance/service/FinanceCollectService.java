package com.ssafy.toktokggubi.domain.finance.service;

import com.ssafy.toktokggubi.domain.card.entity.CardProduct;
import com.ssafy.toktokggubi.domain.card.repository.CardProductRepository;
import com.ssafy.toktokggubi.domain.finance.client.FinopenEduClient;
import com.ssafy.toktokggubi.domain.finance.dto.response.InquireAccountsResponse;
import com.ssafy.toktokggubi.domain.finance.dto.response.InquireCardsResponse;
import com.ssafy.toktokggubi.domain.user.dto.response.FinanceSyncResponse;
import com.ssafy.toktokggubi.domain.user.entity.User;
import com.ssafy.toktokggubi.domain.user.repository.UserRepository;
import com.ssafy.toktokggubi.domain.wallet.entity.UserAccount;
import com.ssafy.toktokggubi.domain.wallet.entity.UserCard;
import com.ssafy.toktokggubi.domain.wallet.repository.UserAccountRepository;
import com.ssafy.toktokggubi.domain.wallet.repository.UserCardRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FinanceCollectService {

    private final FinopenEduClient finClient;
    private final UserRepository userRepository;
    private final UserAccountRepository accountRepository;
    private final UserCardRepository cardRepository;
    private final CardProductRepository cardProductRepository;

    @Transactional
    public FinanceSyncResponse collectAndUpsert(Long userId) {
        User user = userRepository.getReferenceById(userId);
        if (user.getFinanceUserKey() == null) {
            throw new IllegalStateException("financeUserKey 없음: 회원가입 과정에서 user_key를 먼저 발급/저장해야 합니다.");
        }

        // 1) 계좌 동기화 (번호/이름만)
        InquireAccountsResponse accRes = finClient.inquireDemandDepositAccountList(user.getFinanceUserKey());
        if (accRes.header() == null || !"H0000".equals(accRes.header().responseCode())) {
            throw new IllegalStateException("계좌 조회 실패: " +
                    (accRes.header() != null ? accRes.header().responseMessage() : "응답 없음"));
        }

        List<UserAccount> savedAccounts = new ArrayList<>();
        if (accRes.rec() != null) {
            for (var rec : accRes.rec()) {
                final String accountNo = rec.accountNo();
                final String accountName = rec.accountName();

                UserAccount ua = accountRepository.findByUser_UserIdAndAccountNo(userId, accountNo).orElse(null);
                if (ua == null) {
                    ua = UserAccount.builder()
                            .user(user)
                            .accountNo(accountNo)
                            .accountName(accountName)
                            .isActive(Boolean.TRUE)
                            .build();
                } else {
                    ua = ua.toBuilder()
                            .accountName(accountName)
                            .isActive(Boolean.TRUE)
                            .build();
                }
                ua = accountRepository.save(ua);
                savedAccounts.add(ua);
            }
        }

        // 2) 카드 동기화 (cardNo, cvc, cardUniqueNo, cardIssuerCode만)
        InquireCardsResponse cardRes = finClient.inquireSignUpCreditCardList(user.getFinanceUserKey());
        if (cardRes.header() == null || !"H0000".equals(cardRes.header().responseCode())) {
            throw new IllegalStateException("카드 조회 실패: " +
                    (cardRes.header() != null ? cardRes.header().responseMessage() : "응답 없음"));
        }

        List<UserCard> savedCards = new ArrayList<>();
        if (cardRes.rec() != null) {
            for (var rec : cardRes.rec()) {
                final String cardNo = rec.cardNo();
                final String cvc = rec.cvc();
                final String cardUniqueNo = rec.cardUniqueNo();
                final String withdrawalAccountNo = rec.withdrawalAccountNo();

                // 2-1) 카드상품은 반드시 사전 등록되어 있어야 함 (없으면 스킵)
                CardProduct product = cardProductRepository.findById(cardUniqueNo).orElse(null);
                if (product == null) {
                    log.warn("보유카드 동기화 스킵 - 미등록 카드상품 uniqueNo={}", cardUniqueNo);
                    continue;
                }

                // 2-2) 출금계좌 보장
                if (withdrawalAccountNo == null || withdrawalAccountNo.isBlank()) {
                    log.warn("보유카드 동기화 스킵 - withdrawalAccountNo 없음, cardUniqueNo={}", cardUniqueNo);
                    continue;
                }
                UserAccount ua = accountRepository.findByUser_UserIdAndAccountNo(userId, withdrawalAccountNo).orElse(null);
                if (ua == null) {
                    ua = UserAccount.builder()
                            .user(user)
                            .accountNo(withdrawalAccountNo)
                            .accountName("출금계좌")
                            .isActive(Boolean.TRUE)
                            .build();
                    ua = accountRepository.save(ua);
                }

                // 2-3) 유저카드 업서트 (userId + cardUniqueNo)
                UserCard uc = cardRepository.findByUser_UserIdAndCardProduct_CardUniqueNo(userId, cardUniqueNo).orElse(null);
                if (uc == null) {
                    uc = UserCard.builder()
                            .user(user)
                            .userAccount(ua)
                            .cardProduct(product)
                            .cardNo(cardNo)
                            .cvc(cvc)
                            .isActive(Boolean.TRUE)
                            .build();
                } else {
                    uc = uc.toBuilder()
                            .userAccount(ua)
                            .cardNo(cardNo)
                            .cvc(cvc)
                            .isActive(Boolean.TRUE)
                            .build();
                }
                uc = cardRepository.save(uc);
                savedCards.add(uc);
            }
        }

        // 3) 응답 (최소 필드) - Collectors.toList() 사용
        List<FinanceSyncResponse.AccountDto> accountsDto = savedAccounts.stream()
                .map(a -> new FinanceSyncResponse.AccountDto(a.getAccountNo(), a.getAccountName()))
                .collect(Collectors.toList());

        List<FinanceSyncResponse.CardDto> cardsDto = savedCards.stream()
                .map(c -> new FinanceSyncResponse.CardDto(
                        c.getCardNo(),
                        c.getCvc(),
                        c.getCardProduct().getCardIssuer().getCardIssuerCode(),
                        c.getCardProduct().getCardUniqueNo()
                ))
                .collect(Collectors.toList());

        return new FinanceSyncResponse(accountsDto, cardsDto);
    }
}
