package com.ssafy.toktokggubi.domain.finance.dto.response;

public record FinanceResponseHeader(
        String responseCode,
        String responseMessage,
        String apiName,
        String transmissionDate,
        String transmissionTime,
        String institutionCode,
        String apiKey,
        String apiServiceCode,
        String institutionTransactionUniqueNo
) {}
