package com.ssafy.toktokggubi.domain.transaction.service;

import com.ssafy.toktokggubi.domain.transaction.dto.TxCategoryListResponseDto;
import com.ssafy.toktokggubi.domain.transaction.dto.TxCategorySummaryItemDto;
import com.ssafy.toktokggubi.domain.transaction.dto.TxCategorySummaryResponseDto;
import com.ssafy.toktokggubi.domain.transaction.dto.TxSummaryResponseDto;
import com.ssafy.toktokggubi.domain.transaction.repository.TransactionCategoryRepository;
import com.ssafy.toktokggubi.domain.transaction.repository.TransactionSummaryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionSummaryRepository summaryRepo;
    private final TransactionCategoryRepository categoryRepo;

    private static final DateTimeFormatter YMD = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE; // 2025-09-01

    /** 임의 기간 합계 */
    public TxSummaryResponseDto getSummaryByRange(long userId, LocalDate from, LocalDate to) {
        String fromYmd = from.format(YMD);
        String toYmd   = to.format(YMD);
        log.info("[TX-SUM] userId={}, range={}~{}", userId, fromYmd, toYmd);

        var rows = summaryRepo.sumForUserRange(userId, from.format(YMD), to.format(YMD));
        Object[] r = (rows == null || rows.isEmpty()) ? new Object[]{0L, 0L} : rows.get(0);

        long totalAmount = toLong(r, 0);
        long totalCount  = toLong(r, 1);

        return new TxSummaryResponseDto(
                from.format(ISO),
                to.format(ISO),
                totalAmount,
                totalCount
        );
    }

    /** 이번 달 카테고리별 합계/건수 요약 */
    public TxCategorySummaryResponseDto getMonthlyByCategory(long userId, String ym) {
        String ymPrefix = ym + "%";
        var rows = categoryRepo.groupByCategoryRaw(userId, ymPrefix);

        List<TxCategorySummaryItemDto> items = new ArrayList<>(rows.size());
        for (Object[] r : rows) {
            items.add(new TxCategorySummaryItemDto(
                    toLong(r[0]),
                    str(r[1]),
                    toLong(r[2]),
                    toLong(r[3])
            ));
        }
        return new TxCategorySummaryResponseDto(ym, items);
    }

    /** 이번 달 카테고리별 거래 목록 (프론트에서 sizePerCategory 잘라씀) */
    public TxCategoryListResponseDto getCurrentMonthCategoryList(long userId, String ym) {
        String fromYmd = firstDayYmd(ym);
        String toYmd   = lastDayYmd(ym);

        // 상단 합계 블록
        var totalsRows = categoryRepo.findCategoryTotalsRaw(userId, fromYmd, toYmd);

        // 전체 거래 행
        var txRows = categoryRepo.findCategoryAllTransactionsRaw(userId, fromYmd, toYmd);

        // categoryId -> 거래목록 매핑
        Map<Long, List<TxCategoryListResponseDto.TxItem>> itemsByCat = txRows.stream()
                .collect(Collectors.groupingBy(
                        r -> toLong(r[0]),                            // categoryId
                        LinkedHashMap::new,
                        Collectors.mapping(r -> new TxCategoryListResponseDto.TxItem(
                                str(r[2]),                             // txNo
                                toIsoDateTime(str(r[3]), str(r[4])),  // ymd/hms -> ISO
                                toLong(r[5]),                          // amount
                                str(r[6]),                             // cardStatus
                                toLong(r[7]),                          // merchantId
                                str(r[8]),                             // merchantName
                                toLong(r[9]),                          // userCardId
                                str(r[10])                             // cardName
                        ), Collectors.toList())
                ));

        // 카테고리 블록 조립
        List<TxCategoryListResponseDto.CategoryBlock> blocks = new ArrayList<>(totalsRows.size());
        for (Object[] t : totalsRows) {
            long catId      = toLong(t[0]);
            String catName  = str(t[1]);
            long totalAmt   = toLong(t[2]);
            long cnt        = toLong(t[3]);
            blocks.add(new TxCategoryListResponseDto.CategoryBlock(
                    catId, catName, totalAmt, cnt,
                    itemsByCat.getOrDefault(catId, List.of())
            ));
        }

        return new TxCategoryListResponseDto(
                userId,
                "current",
                new TxCategoryListResponseDto.PeriodRange(fromYmd, toYmd),
                blocks
        );
    }

    /* ---------- helpers ---------- */
    private static long toLong(Object o) {
        if (o == null) return 0L;
        if (o instanceof Long l) return l;
        if (o instanceof Integer i) return i.longValue();
        if (o instanceof java.math.BigInteger bi) return bi.longValue();
        if (o instanceof java.math.BigDecimal bd) return bd.longValue();
        if (o instanceof Number n) return n.longValue();
        try { return Long.parseLong(o.toString()); } catch (Exception e) { return 0L; }
    }

    private static String str(Object o) { return o == null ? "" : o.toString(); }

    private static String toIsoDateTime(String ymd, String hms) {
        // ymd: YYYYMMDD, hms: HHMMSS
        return ymd.substring(0,4) + "-" + ymd.substring(4,6) + "-" + ymd.substring(6,8)
                + "T" + hms.substring(0,2) + ":" + hms.substring(2,4) + ":" + hms.substring(4,6);
    }

    private static void requireYm(String ym) {
        if (ym == null || !ym.matches("\\d{6}")) {
            throw new IllegalArgumentException("ym must be yyyyMM");
        }
    }

    private static String firstDayYmd(String ym) {
        requireYm(ym);
        int y = Integer.parseInt(ym.substring(0, 4));
        int m = Integer.parseInt(ym.substring(4, 6));
        return String.format("%04d%02d01", y, m);
    }

    private static String lastDayYmd(String ym) {
        requireYm(ym);
        int y = Integer.parseInt(ym.substring(0, 4));
        int m = Integer.parseInt(ym.substring(4, 6));
        int last = java.time.LocalDate.of(y, m, 1).lengthOfMonth();
        return String.format("%04d%02d%02d", y, m, last);
    }
    private static long toLong(Object[] row, int idx) {
        if (row == null || row.length <= idx || row[idx] == null) return 0L;
        Object o = row[idx];
        if (o instanceof java.math.BigDecimal bd) return bd.longValue();
        if (o instanceof java.math.BigInteger bi) return bi.longValue();
        if (o instanceof Number n) return n.longValue();
        try { return Long.parseLong(o.toString()); } catch (Exception e) { return 0L; }
    }

}
