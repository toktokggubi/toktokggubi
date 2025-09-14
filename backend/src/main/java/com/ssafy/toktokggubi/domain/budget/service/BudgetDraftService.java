package com.ssafy.toktokggubi.domain.budget.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.toktokggubi.domain.budget.dto.CategoryAllocDto;
import com.ssafy.toktokggubi.domain.budget.dto.DraftPatchRequestDto;
import com.ssafy.toktokggubi.domain.budget.dto.DraftSnapshotDto;
import com.ssafy.toktokggubi.domain.budget.dto.FixedExpenseDto;
import com.ssafy.toktokggubi.domain.budget.exception.BudgetException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import static com.ssafy.toktokggubi.domain.budget.exception.BudgetErrorCode.VERSION_MISMATCH;

@Service
@RequiredArgsConstructor
public class BudgetDraftService {

    private static final Duration TTL = Duration.ofMinutes(30);

    private final StringRedisTemplate redis;
    private final ObjectMapper objectMapper;

    private String key(long userId, String budgetYm) {
        return "budget:draft:%d:%s".formatted(userId, budgetYm);
    }

    public long ttlSeconds() {
        return TTL.toSeconds();
    }

    /**
     * 현재 Draft를 로드. 없으면 초기 스냅샷(version=0)을 반환.
     */
    public DraftSnapshotDto getOrCreate(long userId, String budgetYm) {
        String k = key(userId, budgetYm);
        String raw = redis.opsForValue().get(k);
        if (raw == null) {
            return new DraftSnapshotDto(
                    0,                      // version
                    userId,
                    budgetYm,
                    null,                   // totalAmount
                    new ArrayList<>(),      // fixedExpenses
                    new ArrayList<>(),      // selectedCategories
                    new ArrayList<>(),      // categoryAllocations
                    OffsetDateTime.now()    // updatedAt
            );
        }
        try {
            return objectMapper.readValue(raw, new TypeReference<>() {});
        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse draft json", e);
        }
    }

    /**
     * 공통 저장 로직:
     * - expectedVersion이 NULL이면 버전 검증을 건너뜀(총예산 저장 등 초기화/간편 저장용)
     * - expectedVersion이 존재하면 currentVersion과 일치해야 함(낙관적 락)
     * - 부분 필드 머지
     * - 변경 없으면(no-op) 버전 유지, 변경 있으면 +1
     * - TTL 갱신
     *
     * ⚠ get→set 분리라 강한 원자성은 부족. 동시요청이 많다면 WATCH/MULTI 또는 Lua(CAS) 권장.
     */
    public DraftSnapshotDto mergeAndSave(long userId, String budgetYm, DraftPatchRequestDto req) {
        DraftSnapshotDto cur = getOrCreate(userId, budgetYm);

        // 1) 버전 체크
        Integer expected = req.expectedVersion();
        if (expected != null && !expected.equals(cur.version())) {
            Map<String, Object> details = new HashMap<>();
            details.put("expected", expected);
            details.put("actual", cur.version());
            throw new BudgetException(
                    VERSION_MISMATCH,
                    "version mismatch: expected=%s, actual=%d"
                            .formatted(String.valueOf(expected), cur.version()),
                    details
            );
        }

        // 2) 부분 필드 머지
        Long totalAmount = (req.totalAmount() != null) ? req.totalAmount() : cur.totalAmount();
        List<FixedExpenseDto> fixedExpenses =
                (req.fixedExpenses() != null) ? req.fixedExpenses() : cur.fixedExpenses();
        List<Long> selectedCategories =
                (req.selectedCategories() != null) ? req.selectedCategories() : cur.selectedCategories();
        List<CategoryAllocDto> categoryAllocations =
                (req.categoryAllocations() != null) ? req.categoryAllocations() : cur.categoryAllocations();

        // 3) 변경 여부
        boolean noChange = isNoChange(cur, totalAmount, fixedExpenses, selectedCategories, categoryAllocations);

        // 4) 새 버전 결정
        int nextVersion;
        if (cur.version() == 0) {
            // 최초 저장은 v1 시작
            nextVersion = 1;
        } else {
            nextVersion = noChange ? cur.version() : cur.version() + 1;
        }

        DraftSnapshotDto merged = new DraftSnapshotDto(
                nextVersion,               // Integer로 오토박싱
                userId,
                budgetYm,
                totalAmount,
                fixedExpenses,
                selectedCategories,
                categoryAllocations,
                OffsetDateTime.now()
        );

        // 5) Redis 저장 (TTL 포함)
        try {
            String json = objectMapper.writeValueAsString(merged);
            redis.opsForValue().set(key(userId, budgetYm), json, TTL);
        } catch (DataAccessException dae) {
            throw new IllegalStateException("Redis access error", dae);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to write draft json", e);
        }

        return merged;
    }

    /**
     * 커밋 성공 등으로 Draft를 정리할 때 사용.
     */
    public void delete(long userId, String budgetYm) {
        redis.delete(key(userId, budgetYm));
    }

    // ======================
    // 내부 유틸
    // ======================

    private boolean isNoChange(
            DraftSnapshotDto cur,
            Long totalAmount,
            List<FixedExpenseDto> fixedExpenses,
            List<Long> selectedCategories,
            List<CategoryAllocDto> categoryAllocations
    ) {
        // 필요시 정렬/정규화 또는 JSON 기반 비교로 보강 가능
        return Objects.equals(cur.totalAmount(), totalAmount)
                && Objects.equals(cur.fixedExpenses(), fixedExpenses)
                && Objects.equals(cur.selectedCategories(), selectedCategories)
                && Objects.equals(cur.categoryAllocations(), categoryAllocations);
    }
}
