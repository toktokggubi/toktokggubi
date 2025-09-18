import { useCallback, useMemo, useState, useEffect } from "react";
import { router } from "expo-router";
import CategoryBudgetTemplate from "~features/Budget/templates/CategoryBudgetTemplate";
import { useBudgetDraft } from "../context/BudgetDraftContext";
import type { CategoryBudgetItem } from "~features/Budget/templates/CategoryBudgetTemplate/types";
import type { CategoryName } from "@/shared/constants/categoryIcons";

// 유틸: 천원 단위로 내림
const floorToThousand = (n: number) => Math.max(0, Math.floor(n / 1000) * 1000);

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
    '기타': 11,
  };
  return categoryMap[name] || 11;
};

export default function CategoryBudgetScreen() {
  const { 
    availableBudget, 
    selectedCategories, 
    categoryAllocations,
    updateCategorySelection,
    saveCategories, 
    version, 
    isSavingCategories, 
    categoriesError,
    loadDraftData 
  } = useBudgetDraft();

  // 선택된 카테고리 이름들 (데이터베이스와 일치)
  const selectedCategoryNames: CategoryName[] = useMemo(() => {
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
      11: '기타',
    };
    return selectedCategories.map(id => idToName[id]).filter(Boolean) as CategoryName[];
  }, [selectedCategories]);

  // 초기 제안: 균등 분배(천원 단위 내림). 분배 후 남는 나머지는 앞에서부터 천원씩 보정.
  const initialItems: CategoryBudgetItem[] = useMemo(() => {
    if (selectedCategoryNames.length === 0) return [];
    const base = floorToThousand(availableBudget / selectedCategoryNames.length);
    const items = selectedCategoryNames.map((name) => ({ name, amount: base }));
    // 천원 단위 내림으로 생긴 잔여를 앞에서부터 1,000원씩 더해주기
    const allocated = base * selectedCategoryNames.length;
    let remain = availableBudget - allocated;
    let idx = 0;
    while (remain >= 1000 && idx < items.length) {
      items[idx].amount += 1000;
      remain -= 1000;
      idx++;
    }
    return items;
  }, [selectedCategoryNames, availableBudget]);

  // Context에서 직접 카테고리 예산 데이터를 계산
  const items: CategoryBudgetItem[] = useMemo(() => {
    if (categoryAllocations.length > 0) {
      // Context에서 카테고리 예산 데이터를 CategoryBudgetItem 형태로 변환
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
        11: '기타',
      };
      
      const convertedItems: CategoryBudgetItem[] = categoryAllocations.map(allocation => ({
        name: idToName[allocation.categoryId] || '기타',
        amount: allocation.finalAmount,
      }));
      
      return convertedItems;
    } else if (selectedCategoryNames.length > 0) {
      // 이전 데이터가 없으면 기본값(균등 분배) 사용
      return initialItems;
    }
    
    return [];
  }, [categoryAllocations, selectedCategoryNames, initialItems]);

  // 디버깅 로그 (useMemo 밖에서)
  useEffect(() => {
    console.log('=== CategoryBudgetScreen Context 데이터 ===');
    console.log('selectedCategories:', selectedCategories);
    console.log('categoryAllocations:', categoryAllocations);
    console.log('availableBudget:', availableBudget);
    console.log('version:', version);
    console.log('items:', items);
    
    if (categoryAllocations.length > 0) {
      console.log('=== 이전 카테고리 예산 데이터 사용 ===');
      console.log('불러온 카테고리 예산:', items);
    } else if (selectedCategoryNames.length > 0) {
      console.log('=== 초기 카테고리 예산 기본값 사용 ===');
      console.log('사용 가능 예산:', availableBudget);
      console.log('선택된 카테고리:', selectedCategoryNames);
      console.log('기본값 예산:', items);
    } else {
      console.log('=== 빈 배열 반환 ===');
    }
  }, [selectedCategories, categoryAllocations, availableBudget, version, items, selectedCategoryNames]);

  // amount 변경 (Context 직접 업데이트)
  const onChangeItem = useCallback((name: CategoryName, next: number) => {
    console.log('=== 카테고리 예산 변경 ===');
    console.log('카테고리:', name, '새 금액:', next);
    
    const categoryId = getCategoryId(name);
    const newAllocations = categoryAllocations.map(allocation => 
      allocation.categoryId === categoryId 
        ? { ...allocation, finalAmount: next }
        : allocation
    );
    
    console.log('새로운 할당:', newAllocations);
    
    // Context 업데이트 (실제 저장은 다음 단계에서)
    updateCategorySelection(selectedCategories, newAllocations);
  }, [categoryAllocations, selectedCategories, updateCategorySelection]);

  // 네비게이션
  const goPrev = useCallback(() => router.back(), []);

  const goNext = useCallback(async () => {
    console.log('=== 카테고리 예산 저장 시작 ===');
    console.log('Context selectedCategories:', selectedCategories);
    console.log('Context categoryAllocations:', categoryAllocations);
    console.log('현재 버전:', version);
    
    try {
      const result = await saveCategories(selectedCategories, categoryAllocations);
      console.log('=== 카테고리 예산 저장 성공 ===');
      console.log('저장 결과:', result);
      if (result) {
        console.log('새로운 버전:', result.version);
        console.log('새로운 draftId:', result.draftId);
      }
      
      router.push("/budget/summary");
    } catch (error) {
      console.error('=== 카테고리 예산 저장 실패 ===');
      console.error('에러:', error);
      // 에러 처리 (토스트 메시지 등)
    }
  }, [selectedCategories, categoryAllocations, saveCategories, version]);

  return (
    <CategoryBudgetTemplate
      availableNextMonth={availableBudget}
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
