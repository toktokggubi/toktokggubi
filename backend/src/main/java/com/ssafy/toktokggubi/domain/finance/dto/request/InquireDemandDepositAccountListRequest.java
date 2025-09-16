package com.ssafy.toktokggubi.domain.finance.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;

public record InquireDemandDepositAccountListRequest(
        @JsonProperty("Header") FinanceHeaderRequest header
) {}
