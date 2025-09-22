import { useCallback, useMemo, useState, useEffect } from "react";
import { router } from "expo-router";
import SelectCategoryTemplate from "~features/Budget/templates/SelectCategoryTemplate";
import { useBudgetDraft } from "../context/BudgetDraftContext";
import {
  CATEGORY_ICON_BY_NAME,
  type CategoryName,
} from "@/shared/constants/categoryIcons";
import type { CategoryItem } from "~features/Budget/ui/organisms/CategoryGrid/types";

// ✅ 초기 선택 없음
const INITIAL_SELECTED: CategoryName[] = [];

// 전체 카테고리 리스트
const ALL: CategoryName[] = Object.keys(
  CATEGORY_ICON_BY_NAME
) as CategoryName[];

// (선택) 특정 카테고리 비활성화 예시
const DISABLED_SET = new Set<CategoryName>([]);

// 카테고리 이름을 ID로 매핑하는 함수 (데이터베이스와 일치)
const getCategoryId = (name: CategoryName): number => {
  const categoryMap: Record<CategoryName, number> = {
    '식비': 1,
    '카페/간식': 2,
    '술/유흥': 3,
    '생활': 4,
    '쇼핑': 5,
    '뷰티/미용': 6,
    '교통': 7,
    '자동차': 8,
    '의료/건강': 9,
    '문화': 10,
  };
  return categoryMap[name] || 1; // 기본값을 식비로
};

export default function SelectCategoryScreen() {
  const { 
    availableBudget, 
    selectedCategories,
    saveCategories, 
    version, 
    isSavingCategories, 
    categoriesError,
    loadDraftData 
  } = useBudgetDraft();

  // 로컬 상태로 카테고리 선택 관리 (이전 방식)
  const [selected, setSelected] = useState<CategoryName[]>(INITIAL_SELECTED);

  // 이전에 선택된 카테고리가 있으면 불러오기
  useEffect(() => {
    loadDraftData();
    
    if (selectedCategories.length > 0) {
      // ID를 카테고리 이름으로 변환
      const idToName: Record<number, CategoryName> = {
        1: '식비',
        2: '카페/간식',
        3: '술/유흥',
        4: '생활',
        5: '쇼핑',
        6: '뷰티/미용',
        7: '교통',
        8: '자동차',
        9: '의료/건강',
        10: '문화',
      };
      
      const categoryNames = selectedCategories
        .map(id => idToName[id])
        .filter(Boolean) as CategoryName[];
      
      setSelected(categoryNames);
    }
  }, [selectedCategories, loadDraftData]);

  // 템플릿에 줄 아이템 변환 (고유한 ID를 키로 사용)
  const items: CategoryItem[] = useMemo(
    () =>
      ALL.map((name) => ({
        key: String(getCategoryId(name)), // 카테고리 ID를 문자열로 변환하여 키로 사용
        label: name,
        icon: CATEGORY_ICON_BY_NAME[name],
        disabled: DISABLED_SET.has(name),
      })),
    []
  );

  // 선택 토글 핸들러 (이전 방식)
  const toggle = useCallback((key: string) => {
    // ID를 카테고리 이름으로 변환
    const categoryName = ALL.find(name => String(getCategoryId(name)) === key);
    if (!categoryName) return;
    
    setSelected((prev) =>
      prev.includes(categoryName) ? prev.filter((k) => k !== categoryName) : [...prev, categoryName]
    );
  }, []);

  // 네비게이션
  const goPrev = useCallback(() => router.back(), []);
  
  const goNext = useCallback(async () => {
    
    try {
      const categoryIds = selected.map(name => getCategoryId(name));
      const allocations = selected.map(name => ({
        categoryId: getCategoryId(name),
        finalAmount: 0, // 초기값은 0, 다음 단계에서 설정
      }));


      const result = await saveCategories(categoryIds, allocations);
      if (result) {
      }
      
      router.push("/budget/category-budget");
    } catch (error) {
      // 에러 처리 (토스트 메시지 등)
    }
  }, [selected, saveCategories, version]);

  // 선택된 카테고리 이름들을 ID로 변환
  const selectedKeys = selected.map(name => String(getCategoryId(name)));

  return (
    <SelectCategoryTemplate
      // 헤더
      title="카테고리 선택"
      subtitle="예산을 관리할 카테고리를 선택해주세요."
      // 그리드
      items={items}
      selectedKeys={selectedKeys}
      onToggle={toggle}
      // 푸터
      stepIndex={2}
      stepTotal={5}
      onPressPrev={goPrev}
      onPressNext={goNext}
      nextDisabled={selected.length === 0 || isSavingCategories}
    />
  );
}
