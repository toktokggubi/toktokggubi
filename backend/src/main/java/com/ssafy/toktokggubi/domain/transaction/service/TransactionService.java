package com.ssafy.toktokggubi.domain.transaction.service;

import com.ssafy.toktokggubi.domain.transaction.dto.TxSummaryResponse;
import com.ssafy.toktokggubi.domain.transaction.repository.TransactionSummaryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionSummaryRepository repo;

    public TxSummaryResponse getMonthlySummary(long userId, String ym) {
        var row = repo.sumForUserMonth(userId, ym);
        return new TxSummaryResponse(
                ym,
                row.totalAmount(),
                row.totalCount()
        );
    }
}
