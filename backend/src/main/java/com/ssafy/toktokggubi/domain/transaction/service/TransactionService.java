package com.ssafy.toktokggubi.domain.transaction.service;

import com.ssafy.toktokggubi.domain.transaction.dto.TxCategoryListResponseDto;
import com.ssafy.toktokggubi.domain.transaction.dto.TxCategorySummaryResponseDto;
import com.ssafy.toktokggubi.domain.transaction.dto.TxSummaryResponseDto;
import com.ssafy.toktokggubi.domain.transaction.repository.TransactionCategoryRepository;
import com.ssafy.toktokggubi.domain.transaction.repository.TransactionSummaryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.LinkedHashMap;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionSummaryRepository summaryRepo;
    private final TransactionCategoryRepository categoryRepo;

    private static final DateTimeFormatter YMD = DateTimeFormatter.BASIC_ISO_DATE; // 20250901
    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE; // 2025-09-01

    /** 임의 기간(여러 달 가능) 합계 */
    public TxSummaryResponseDto getSummaryByRange(long userId, LocalDate from, LocalDate to) {
        var row = summaryRepo.sumForUserRange(
                userId,
                from.format(YMD),
                to.format(YMD)
        );
        return new TxSummaryResponseDto(
                from.format(ISO),
                to.format(ISO),
                row.totalAmount(),
                row.totalCount()
        );
    }


    // 기존 TransactionService에 메서드 하나 추가
    public TxCategorySummaryResponseDto getMonthlyByCategory(long userId, String ym) {
        var items = categoryRepo.groupByCategory(userId, ym); // 레포에서 집계
        return new TxCategorySummaryResponseDto(ym, items);
    }

    /** 이번 달 카테고리별 거래 목록 (sizePerCategory=2 고정 대신, 필요 시 파라미터로 바꿔도 됨) */
    public TxCategoryListResponseDto getCurrentMonthCategoryList(long userId, String ym) {
        String fromYmd = firstDayYmd(ym); // e.g. 20250901
        String toYmd   = lastDayYmd(ym);  // e.g. 20250930

        var totals = categoryRepo.findCategoryTotals(userId, fromYmd, toYmd);
        var allTx  = categoryRepo.findCategoryAllTransactions(userId, fromYmd, toYmd);

        Map<Long, List<TxCategoryListResponseDto.TxItem>> itemsByCat = allTx.stream()
                .collect(Collectors.groupingBy(
                        TransactionCategoryRepository.CategoryTxRow::categoryId,
                        LinkedHashMap::new,
                        Collectors.mapping(r -> new TxCategoryListResponseDto.TxItem(
                                r.transactionUniqueNo(),
                                toIsoDateTime(r.ymd(), r.hms()),
                                r.amount(),
                                r.cardStatus(),
                                r.merchantId(),
                                r.merchantName(),
                                r.userCardId(),
                                r.cardName()
                        ), Collectors.toList())
                ));

        List<TxCategoryListResponseDto.CategoryBlock> blocks = new ArrayList<>();
        for (var t : totals) {
            blocks.add(new TxCategoryListResponseDto.CategoryBlock(
                    t.categoryId(), t.categoryName(), t.totalAmount(), t.count(),
                    itemsByCat.getOrDefault(t.categoryId(), List.of())
            ));
        }

        return new TxCategoryListResponseDto(
                userId,
                "current",
                new TxCategoryListResponseDto.PeriodRange(fromYmd, toYmd),
                blocks
        );
    }

    // --- helpers (YearMonth 안 씀) ---
    private String firstDayYmd(String ym) {
        requireYm(ym);
        int y = Integer.parseInt(ym.substring(0, 4));
        int m = Integer.parseInt(ym.substring(4, 6));
        return String.format("%04d%02d01", y, m);
    }

    private String lastDayYmd(String ym) {
        requireYm(ym);
        int y = Integer.parseInt(ym.substring(0, 4));
        int m = Integer.parseInt(ym.substring(4, 6));
        int last = java.time.LocalDate.of(y, m, 1).lengthOfMonth();
        return String.format("%04d%02d%02d", y, m, last);
    }

    private void requireYm(String ym) {
        if (ym == null || !ym.matches("\\d{6}")) {
            throw new IllegalArgumentException("ym must be yyyyMM");
        }
    }

    private static String toIsoDateTime(String ymd, String hms) {
        return ymd.substring(0,4) + "-" + ymd.substring(4,6) + "-" + ymd.substring(6,8)
                + "T" + hms.substring(0,2) + ":" + hms.substring(2,4) + ":" + hms.substring(4,6);
    }
}
