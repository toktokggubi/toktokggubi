import { useCallback, useMemo, useState, useEffect } from "react";
import { router } from "expo-router";
import CategoryBudgetTemplate from "~features/Budget/templates/CategoryBudgetTemplate";
import { useBudgetDraft } from "../context/BudgetDraftContext";
import type { CategoryBudgetItem } from "~features/Budget/templates/CategoryBudgetTemplate/types";
import type { CategoryName } from "@/shared/constants/categoryIcons";
import type { CategoryAllocation } from "../types/budget.types";

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
  };
  return categoryMap[name] || 1;
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



  // 페이지 진입 시 초기값 설정 (한 번만 실행)
  useEffect(() => {
    // 카테고리가 선택되어 있고, 할당이 비어있거나 모든 값이 0원일 때 초기값 설정
    const needsInitialization = selectedCategories.length > 0 && (
      categoryAllocations.length === 0 || 
      categoryAllocations.every(allocation => allocation.finalAmount === 0)
    );
    
    if (needsInitialization) {
      console.log('=== 페이지 진입, 초기값 설정 ===');
      console.log('선택된 카테고리:', selectedCategories);
      console.log('사용 가능 예산:', availableBudget);
      console.log('현재 할당:', categoryAllocations);
      
      // 초기 할당값 생성 (균등 분배)
      const baseAmount = floorToThousand(availableBudget / selectedCategories.length);
      const initialAllocations: CategoryAllocation[] = selectedCategories.map(categoryId => ({
        categoryId,
        finalAmount: baseAmount,
      }));
      
      // 잔여 예산을 앞에서부터 천원씩 추가
      const allocated = baseAmount * selectedCategories.length;
      let remain = availableBudget - allocated;
      let idx = 0;
      while (remain >= 1000 && idx < initialAllocations.length) {
        initialAllocations[idx].finalAmount += 1000;
        remain -= 1000;
        idx++;
      }
      
      console.log('생성된 초기 할당:', initialAllocations);
      
      // Context 업데이트
      updateCategorySelection(selectedCategories, initialAllocations);
    }
  }, [selectedCategories.length, availableBudget, categoryAllocations.length]); // categoryAllocations.length도 의존성에 추가

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
      };
      
      const convertedItems: CategoryBudgetItem[] = categoryAllocations.map(allocation => ({
        name: idToName[allocation.categoryId] || '식비',
        amount: allocation.finalAmount,
      }));
      
      return convertedItems;
    }
    
    return [];
  }, [categoryAllocations]);

  // 디버깅 로그
  useEffect(() => {
    console.log('=== CategoryBudgetScreen Context 데이터 ===');
    console.log('selectedCategories:', selectedCategories);
    console.log('categoryAllocations:', categoryAllocations);
    console.log('availableBudget:', availableBudget);
    console.log('version:', version);
    console.log('items:', items);
    
    if (categoryAllocations.length > 0) {
      console.log('=== 카테고리 예산 데이터 사용 ===');
      console.log('불러온 카테고리 예산:', items);
    } else {
      console.log('=== 초기값 설정 대기 중 ===');
    }
  }, [selectedCategories, categoryAllocations, availableBudget, version, items]);

  // amount 변경 (Context 직접 업데이트)
  const onChangeItem = useCallback((name: CategoryName, next: number) => {
    console.log('=== 사용자 카테고리 예산 변경 ===');
    console.log('카테고리:', name, '새 금액:', next);
    console.log('기존 할당:', categoryAllocations);
    
    const categoryId = getCategoryId(name);
    const newAllocations = categoryAllocations.map(allocation => 
      allocation.categoryId === categoryId 
        ? { ...allocation, finalAmount: next }
        : allocation
    );
    
    console.log('업데이트된 할당:', newAllocations);
    
    // Context 업데이트 (사용자 수정사항 저장)
    updateCategorySelection(selectedCategories, newAllocations);
    console.log('=== 사용자 수정사항 Context에 저장 완료 ===');
  }, [categoryAllocations, selectedCategories, updateCategorySelection]);

  // 네비게이션
  const goPrev = useCallback(() => router.back(), []);

  // 예산 합계 검증
  const isBudgetValid = useMemo(() => {
    const totalAllocated = categoryAllocations.reduce((sum, allocation) => sum + allocation.finalAmount, 0);
    const isValid = totalAllocated === availableBudget;
    
    console.log('=== 예산 검증 ===');
    console.log('사용 가능 예산:', availableBudget);
    console.log('할당된 총 예산:', totalAllocated);
    console.log('검증 결과:', isValid);
    
    return isValid;
  }, [categoryAllocations, availableBudget]);

  const goNext = useCallback(async () => {
    // 예산 합계 검증
    if (!isBudgetValid) {
      console.log('=== 예산 합계 불일치로 인한 진행 불가 ===');
      console.log('사용 가능 예산:', availableBudget);
      console.log('할당된 총 예산:', categoryAllocations.reduce((sum, allocation) => sum + allocation.finalAmount, 0));
      // TODO: 사용자에게 알림 표시 (토스트 메시지 등)
      return;
    }

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
      console.error('에러 상세:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: (error as any)?.response?.status,
        statusText: (error as any)?.response?.statusText,
        data: (error as any)?.response?.data,
      });
      // TODO: 사용자에게 에러 알림 표시 (토스트 메시지 등)
    }
  }, [selectedCategories, categoryAllocations, saveCategories, version, isBudgetValid, availableBudget]);

  return (
    <CategoryBudgetTemplate
      availableNextMonth={availableBudget}
      items={items}
      onChangeItem={onChangeItem}
      onPressPrev={goPrev}
      onPressNext={goNext}
      nextDisabled={!isBudgetValid}
      stepIndex={3}
      stepTotal={5}
      title="카테고리별 예산 설정"
      subtitle="꺼비가 회원님의 정보를 바탕으로 제안했어요."
    />
  );
}
