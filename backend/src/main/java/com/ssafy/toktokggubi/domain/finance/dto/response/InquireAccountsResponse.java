package com.ssafy.toktokggubi.domain.finance.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record InquireAccountsResponse(
        @JsonProperty("Header") FinanceResponseHeader header,
        @JsonProperty("REC")    List<AccountRec> rec
) {}
