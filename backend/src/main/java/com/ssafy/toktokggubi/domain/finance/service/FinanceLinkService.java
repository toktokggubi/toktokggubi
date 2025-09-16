package com.ssafy.toktokggubi.domain.finance.service;

import com.ssafy.toktokggubi.domain.finance.client.FinopenApiClient;
import com.ssafy.toktokggubi.domain.finance.dto.response.FinMemberResponse;
import com.ssafy.toktokggubi.domain.user.entity.User;
import com.ssafy.toktokggubi.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FinanceLinkService {
    private final FinopenApiClient finopenApiClient;
    private final UserRepository userRepository;

    @Transactional
    public void ensureFinanceUserKey(User user) {
        if (user.getFinanceUserKey() != null && !user.getFinanceUserKey().isBlank()) {
            return;
        }
        String email = user.getEmail();
        if (email == null || email.isBlank()) {
            throw new IllegalStateException("금융망 연동 실패: 사용자 이메일이 없습니다.");
        }

        String userKey = finopenApiClient.search(email)
                .map(FinMemberResponse::userKey)
                .filter(k -> !k.isBlank())
                .orElseGet(() -> finopenApiClient.create(email).userKey());

        userRepository.save(user.toBuilder().financeUserKey(userKey).build());
    }
}