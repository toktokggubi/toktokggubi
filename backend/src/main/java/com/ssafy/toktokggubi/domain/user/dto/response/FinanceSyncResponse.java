package com.ssafy.toktokggubi.domain.user.dto.response;

import java.util.List;

public record FinanceSyncResponse(
        List<AccountDto> accounts,
        List<CardDto> cards
) {
    public record AccountDto(String accountNo, String accountName) {
    }

    public record CardDto(String cardNo, String cvc, String cardIssuerCode, String cardUniqueNo) {
    }
}