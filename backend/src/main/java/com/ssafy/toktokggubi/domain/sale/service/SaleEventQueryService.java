package com.ssafy.toktokggubi.domain.sale.service;

import com.ssafy.toktokggubi.domain.sale.dto.response.FranchiseSummaryResponse;
import com.ssafy.toktokggubi.domain.sale.dto.response.SaleEventResponse;
import com.ssafy.toktokggubi.domain.sale.entity.SaleEvent;
import com.ssafy.toktokggubi.domain.sale.repository.SaleEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SaleEventQueryService {

    private final SaleEventRepository saleEventRepository;

    public List<SaleEventResponse> getByMonth(int year, int month, Long franchiseId) {
        var ym = YearMonth.of(year, month);
        LocalDateTime startInclusive = ym.atDay(1).atStartOfDay();
        LocalDateTime endExclusive = ym.plusMonths(1).atDay(1).atStartOfDay();

        return saleEventRepository
                .findOverlapping(startInclusive, endExclusive, franchiseId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<SaleEventResponse> getByPeriod(LocalDate startDate, LocalDate endDate, Long franchiseId) {
        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("endDate must be on/after startDate");
        }
        LocalDateTime startInclusive = startDate.atStartOfDay();
        LocalDateTime endExclusive = endDate.plusDays(1).atStartOfDay();

        return saleEventRepository
                .findOverlapping(startInclusive, endExclusive, franchiseId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private SaleEventResponse toResponse(SaleEvent se) {
        var f = se.getFranchise();
        return new SaleEventResponse(
                se.getSaleEventId(),
                new FranchiseSummaryResponse(
                        f.getFranchiseId(),
                        f.getFranchiseName(),
                        f.getImageUrl()
                ),
                se.getTitle(),
                se.getStartsAt(),
                se.getEndsAt(),
                se.getDescription()
        );
    }
}
