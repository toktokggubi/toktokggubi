import { useCallback, useMemo, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import SelectCategoryTemplate from "~features/Budget/templates/SelectCategoryTemplate";
import {
  CATEGORY_ICON_BY_NAME,
  type CategoryName,
} from "@/shared/constants/categoryIcons";
import type { CategoryItem } from "~features/Budget/ui/organisms/CategoryGrid/types";

// 🔄 REDIS 전환 시 수정할 부분들:
// 1. import 추가: useBudgetDraftQuery, useSaveCategoriesMutation, useCommitBudgetMutation, useBudgetDraftFormData, useBudgetDraftActions, useBudgetDraftCalculations
// 2. useLocalSearchParams 제거하고 draft store에서 데이터 가져오기
// 3. 로컬 상태(selected) 대신 draft store 사용
// 4. goNext에서 파라미터 전달 대신 Redis 저장 후 커밋

// ✅ 초기 선택 없음
const INITIAL_SELECTED: CategoryName[] = [];

// 전체 카테고리 리스트
const ALL: CategoryName[] = Object.keys(
  CATEGORY_ICON_BY_NAME
) as CategoryName[];

// (선택) 특정 카테고리 비활성화 예시
const DISABLED_SET = new Set<CategoryName>([]);

export default function SelectCategoryScreen() {
  // 🔄 REDIS 전환 시: 이 부분을 draft store에서 가져오도록 변경
  // const { totalAmount, fixedExpenses } = useBudgetDraftFormData();
  // const { updateCategorySelection } = useBudgetDraftActions();
  // const { getAvailableBudget } = useBudgetDraftCalculations();
  // const { version } = useBudgetDraftData();
  // const saveCategoriesMutation = useSaveCategoriesMutation();
  // const commitMutation = useCommitBudgetMutation();
  // const { data: draftData } = useBudgetDraftQuery();

  // 현재: 파라미터로 받은 데이터
  const { totalAmount, fixedExpenses } = useLocalSearchParams<{
    totalAmount: string;
    fixedExpenses: string;
  }>();

  const totalBudget = totalAmount ? parseInt(totalAmount) : 1000000;
  const parsedFixedExpenses = fixedExpenses
    ? JSON.parse(decodeURIComponent(fixedExpenses))
    : [];

  // 🔄 REDIS 전환 시: 로컬 상태 대신 draft store 사용
  // const [localSelected, setLocalSelected] = useState<CategoryName[]>(INITIAL_SELECTED);
  // const [localAllocations, setLocalAllocations] = useState<Record<string, number>>({});

  // 현재: 로컬 상태로 카테고리 선택 관리
  const [selected, setSelected] = useState<CategoryName[]>(INITIAL_SELECTED);

  // 템플릿에 줄 아이템 변환
  const items: CategoryItem[] = useMemo(
    () =>
      ALL.map((name) => ({
        key: name,
        label: name,
        icon: CATEGORY_ICON_BY_NAME[name],
        disabled: DISABLED_SET.has(name),
      })),
    []
  );

  // 선택 토글 핸들러
  const toggle = useCallback((key: CategoryName) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }, []);

  // 네비게이션
  const goPrev = useCallback(() => router.back(), []);
  const goNext = useCallback(() => {
    // 🔄 REDIS 전환 시: 파라미터 전달 대신 Redis 저장 후 커밋
    // const categoryIds = selected.map(name => CATEGORY_NAME_TO_ID[name]);
    // const allocations = selected.map(name => ({
    //   categoryId: CATEGORY_NAME_TO_ID[name],
    //   finalAmount: localAllocations[name] || 0,
    // }));
    //
    // updateCategorySelection(categoryIds, allocations);
    // autoSaveCategories(categoryIds, allocations);
    //
    // commitMutation.mutate({}, {
    //   onSuccess: () => {
    //     router.push("/(tabs)/home");
    //   },
    //   onError: (error) => {
    //     console.error('예산 커밋 실패:', error);
    //   },
    // });

    // 현재: 파라미터로 모든 데이터 전달 (완료 페이지가 없으므로 홈으로)
    const selectedCategoriesParam = encodeURIComponent(
      JSON.stringify(selected)
    );
    router.push({
      pathname: "/budget/category-budget",
      params: {
        totalAmount: totalAmount,
        fixedExpenses: fixedExpenses,
        selectedCategories: selectedCategoriesParam,
      },
    });
  }, [selected, totalAmount, fixedExpenses]);

  return (
    <SelectCategoryTemplate
      // 헤더
      title="카테고리 선택"
      subtitle="예산을 관리할 카테고리를 선택해주세요."
      // 그리드
      items={items}
      selectedKeys={selected}
      onToggle={toggle}
      // 푸터
      stepIndex={2}
      stepTotal={5}
      onPressPrev={goPrev}
      onPressNext={goNext}
      nextDisabled={selected.length === 0}
    />
  );
}
