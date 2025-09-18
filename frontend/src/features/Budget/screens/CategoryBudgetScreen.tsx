import { useCallback, useMemo, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import CategoryBudgetTemplate from "~features/Budget/templates/CategoryBudgetTemplate";
import type { CategoryBudgetItem } from "~features/Budget/templates/CategoryBudgetTemplate/types";
import type { CategoryName } from "@/shared/constants/categoryIcons";

// 🔄 REDIS 전환 시 수정할 부분들:
// 1) useLocalSearchParams 제거하고 draft store/query 훅으로 교체
//    - useBudgetDraftQuery, useBudgetDraftData, useBudgetDraftActions
//    - useSaveCategoriesMutation, useCommitBudgetMutation 등
// 2) selectedCategories/allocations은 store 기준으로 관리
// 3) goNext에서는 파라미터 이동 대신 Redis 저장 후 커밋

// 유틸: 천원 단위로 내림
const floorToThousand = (n: number) => Math.max(0, Math.floor(n / 1000) * 1000);

type FixedExpenseParam = {
  title: string;
  amount: number;
  payDay?: number;
  includeInBudget?: boolean;
};

export default function CategoryBudgetScreen() {
  // 현재는 이전 단계에서 파라미터로 전달받음
  const { totalAmount, fixedExpenses, selectedCategories } =
    useLocalSearchParams<{
      totalAmount?: string;
      fixedExpenses?: string;
      selectedCategories?: string; // JSON-encoded CategoryName[]
    }>();

  // 총예산
  const totalBudget = totalAmount ? parseInt(totalAmount, 10) : 0;

  // 고정지출 (예산 포함 항목만 차감)
  const parsedFixed: FixedExpenseParam[] = useMemo(() => {
    if (!fixedExpenses) return [];
    try {
      return JSON.parse(
        decodeURIComponent(fixedExpenses)
      ) as FixedExpenseParam[];
    } catch {
      return [];
    }
  }, [fixedExpenses]);

  const fixedIncludedSum = useMemo(
    () =>
      parsedFixed.reduce((acc, cur) => {
        if (cur?.includeInBudget === false) return acc;
        return acc + (cur?.amount || 0);
      }, 0),
    [parsedFixed]
  );

  // 다음 달 사용 가능 예산
  const availableNextMonth = Math.max(0, totalBudget - fixedIncludedSum);

  // 선택된 카테고리 목록
  const selected: CategoryName[] = useMemo(() => {
    if (!selectedCategories) return [];
    try {
      return JSON.parse(
        decodeURIComponent(selectedCategories)
      ) as CategoryName[];
    } catch {
      return [];
    }
  }, [selectedCategories]);

  // 초기 제안: 균등 분배(천원 단위 내림). 분배 후 남는 나머지는 앞에서부터 천원씩 보정.
  const initialItems: CategoryBudgetItem[] = useMemo(() => {
    if (selected.length === 0) return [];
    const base = floorToThousand(availableNextMonth / selected.length);
    const items = selected.map((name) => ({ name, amount: base }));
    // 천원 단위 내림으로 생긴 잔여를 앞에서부터 1,000원씩 더해주기
    const allocated = base * selected.length;
    let remain = availableNextMonth - allocated;
    let idx = 0;
    while (remain >= 1000 && idx < items.length) {
      items[idx].amount += 1000;
      remain -= 1000;
      idx++;
    }
    return items;
  }, [selected, availableNextMonth]);

  // 제어 상태: 카테고리별 금액
  const [items, setItems] = useState<CategoryBudgetItem[]>(initialItems);

  // amount 변경
  const onChangeItem = useCallback((name: CategoryName, next: number) => {
    setItems((prev) =>
      prev.map((it) => (it.name === name ? { ...it, amount: next } : it))
    );
  }, []);

  // 네비게이션
  const goPrev = useCallback(() => router.back(), []);

  const goNext = useCallback(() => {
    // 🔄 REDIS 전환 시:
    // const allocations = items.map(it => ({ categoryId: ..., finalAmount: it.amount }));
    // updateCategorySelection(...); autoSaveCategories(...);
    // commitMutation.mutate(...)

    // 예산 요약 화면으로 이동
    const categoryBudgetsParam = encodeURIComponent(JSON.stringify(items));
    router.push({
      pathname: "/budget/summary",
      params: {
        totalAmount,
        fixedExpenses,
        selectedCategories,
        categoryBudgets: categoryBudgetsParam,
      },
    });
  }, [items, totalAmount, fixedExpenses, selectedCategories]);

  return (
    <CategoryBudgetTemplate
      availableNextMonth={availableNextMonth}
      items={items}
      onChangeItem={onChangeItem}
      onPressPrev={goPrev}
      onPressNext={goNext}
      stepIndex={3}
      stepTotal={5}
      title="카테고리별 예산 설정"
      subtitle="꺼비가 회원님의 정보를 바탕으로 제안했어요."
    />
  );
}
