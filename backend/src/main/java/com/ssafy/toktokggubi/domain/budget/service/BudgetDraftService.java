package com.ssafy.toktokggubi.domain.budget.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.toktokggubi.domain.budget.dto.CategoryAllocDto;
import com.ssafy.toktokggubi.domain.budget.dto.DraftPatchRequest;
import com.ssafy.toktokggubi.domain.budget.dto.DraftSnapshotDto;
import com.ssafy.toktokggubi.domain.budget.dto.FixedExpenseDto;
import com.ssafy.toktokggubi.domain.budget.exception.BudgetException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import static com.ssafy.toktokggubi.domain.budget.exception.BudgetErrorCode.*;
import com.ssafy.toktokggubi.domain.budget.exception.BudgetException;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

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
     * 현재 Draft를 로드. 없으면 초기 스냅샷을 반환.
     */
    public DraftSnapshotDto getOrCreate(long userId, String budgetYm) {
        String k = key(userId, budgetYm);
        String raw = redis.opsForValue().get(k);
        if (raw == null) {
            return new DraftSnapshotDto(
                    0, userId, budgetYm, null,
                    new ArrayList<>(), new ArrayList<>(), new ArrayList<>(),
                    OffsetDateTime.now()
            );
        }
        try {
            return objectMapper.readValue(raw, new TypeReference<>() {});
        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse draft json", e);
        }
    }

    /**
     * BD-1/3/6 공통 저장 엔드포인트의 핵심 로직.
     * - expectedVersion이 현재 버전과 다르면 예외
     * - 부분 필드만 머지
     * - 버전 +1 후 TTL과 함께 Redis에 저장
     */
    public DraftSnapshotDto mergeAndSave(long userId, String budgetYm, DraftPatchRequest req) {
        DraftSnapshotDto cur = getOrCreate(userId, budgetYm);

        // 1) 낙관적 락: 버전 체크
        Integer expected = req.expectedVersion();
        if (expected != null && !expected.equals(cur.version())) {
            throw new BudgetException(
                    VERSION_MISMATCH,
                    "version mismatch: expected=%d, actual=%d".formatted(expected, cur.version()),
                    java.util.Map.of("expected", expected, "actual", cur.version())
            );
        }

        // 2) 부분 필드 머지
        Long totalAmount = (req.totalAmount() != null) ? req.totalAmount() : cur.totalAmount();
        List<FixedExpenseDto> fixedExpenses = (req.fixedExpenses() != null) ? req.fixedExpenses() : cur.fixedExpenses();
        List<Long> selectedCategories = (req.selectedCategories() != null) ? req.selectedCategories() : cur.selectedCategories();
        List<CategoryAllocDto> categoryAllocations = (req.categoryAllocations() != null) ? req.categoryAllocations() : cur.categoryAllocations();

        DraftSnapshotDto merged = new DraftSnapshotDto(
                cur.version() + 1,
                userId,
                budgetYm,
                totalAmount,
                fixedExpenses,
                selectedCategories,
                categoryAllocations,
                OffsetDateTime.now()
        );

        // 3) Redis 저장 (TTL 포함)
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
}
