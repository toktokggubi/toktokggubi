package com.ssafy.toktokggubi.domain.transaction.service;

import com.ssafy.toktokggubi.domain.transaction.dto.TxCategorySummaryResponse;
import com.ssafy.toktokggubi.domain.transaction.dto.TxSummaryResponse;
import com.ssafy.toktokggubi.domain.transaction.repository.TransactionCategoryRepository;
import com.ssafy.toktokggubi.domain.transaction.repository.TransactionSummaryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionSummaryRepository summaryRepo;
    private final TransactionCategoryRepository categoryRepo;

    private static final DateTimeFormatter YMD = DateTimeFormatter.BASIC_ISO_DATE; // 20250901
    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE; // 2025-09-01

    /** 임의 기간(여러 달 가능) 합계 */
    public TxSummaryResponse getSummaryByRange(long userId, LocalDate from, LocalDate to) {
        var row = summaryRepo.sumForUserRange(
                userId,
                from.format(YMD),
                to.format(YMD)
        );
        return new TxSummaryResponse(
                from.format(ISO),
                to.format(ISO),
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
