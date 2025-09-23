package com.ssafy.toktokggubi.domain.sale.dto.response;

import java.time.LocalDateTime;

public record SaleEventResponse(
        Long saleEventId,
        FranchiseSummaryResponse franchise,
        String title,
        LocalDateTime startsAt,
        LocalDateTime endsAt,
        String description
) {}