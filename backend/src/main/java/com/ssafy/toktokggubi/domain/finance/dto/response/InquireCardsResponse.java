package com.ssafy.toktokggubi.domain.finance.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record InquireCardsResponse(
        @JsonProperty("Header") FinanceResponseHeader header,
        @JsonProperty("REC")    List<CardRec> rec
) {}
