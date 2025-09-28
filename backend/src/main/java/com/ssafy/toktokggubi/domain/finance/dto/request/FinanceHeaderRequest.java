package com.ssafy.toktokggubi.domain.finance.dto.request;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record FinanceHeaderRequest(
        String apiName,
        String transmissionDate,              // yyyyMMdd
        String transmissionTime,              // HHmmss
        String institutionCode,               // 00100
        String fintechAppNo,                  // 001
        String apiServiceCode,                // = apiName
        String institutionTransactionUniqueNo,// yyyyMMddHHmmss + 6자리
        String apiKey,
        String userKey
) {
}
