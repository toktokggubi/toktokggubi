package com.ssafy.toktokggubi.domain.transaction.service;

import com.ssafy.toktokggubi.domain.transaction.dto.TxCategorySummaryResponse;
import com.ssafy.toktokggubi.domain.transaction.dto.TxSummaryResponse;
import com.ssafy.toktokggubi.domain.transaction.repository.TransactionCategoryRepository;
import com.ssafy.toktokggubi.domain.transaction.repository.TransactionSummaryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionSummaryRepository repo;
    private final TransactionCategoryRepository categoryRepo;

    public TxSummaryResponse getMonthlySummary(long userId, String ym) {
        var row = repo.sumForUserMonth(userId, ym);
        return new TxSummaryResponse(
                ym,
                row.totalAmount(),
                row.totalCount()
        );
    }
    // 기존 TransactionService에 메서드 하나 추가
    public TxCategorySummaryResponse getMonthlyByCategory(long userId, String ym) {
        var items = categoryRepo.groupByCategory(userId, ym); // 레포에서 집계
        return new TxCategorySummaryResponse(ym, items);
    }
}
