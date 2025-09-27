import { useCallback, useMemo, useState, useEffect } from "react";
import { router } from "expo-router";
import CategoryBudgetTemplate from "~features/Budget/templates/CategoryBudgetTemplate";
import { useBudgetDraft } from "../context/BudgetDraftContext";
import type { CategoryBudgetItem } from "~features/Budget/templates/CategoryBudgetTemplate/types";
import type { CategoryName } from "@/shared/constants/categoryIcons";
import type { CategoryAllocation } from "../types/budget.types";
import LoadingOverlay from "@/shared/ui/LoadingOverlay";

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
  const [aiRecommendationSuccess, setAiRecommendationSuccess] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
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
    // 카테고리가 선택되어 있고, 할당이 비어있거나 모든 값이 0원일 때만 초기값 설정
    const needsInitialization = selectedCategories.length > 0 && (
      categoryAllocations.length === 0 || 
      categoryAllocations.every(allocation => allocation.finalAmount === 0)
    );
    
    if (needsInitialization) {
      setIsLoadingAI(true);
      // 백엔드에서 AI 추천값을 받아오기 위해 saveCategories 호출
      // 이때 빈 allocations로 보내면 백엔드에서 AI 추천값을 반환
      const emptyAllocations: CategoryAllocation[] = selectedCategories.map(categoryId => ({
        categoryId,
        finalAmount: 0,
      }));
      
      // 백엔드에서 AI 추천값을 받아오기 위해 저장 시도
      saveCategories(selectedCategories, emptyAllocations).then((result) => {
        if (result && result.snapshot && result.snapshot.categoryAllocations) {
          // 백엔드에서 받은 AI 추천값으로 업데이트
          updateCategorySelection(selectedCategories, result.snapshot.categoryAllocations);
          setAiRecommendationSuccess(true);
        }
      }).catch((error) => {
        // AI 추천값 로딩 실패, 균등 분배로 폴백
        setAiRecommendationSuccess(false);
        // AI 추천 실패 시 기존 균등 분배 로직 사용
        const baseAmount = floorToThousand(availableBudget / selectedCategories.length);
        const fallbackAllocations: CategoryAllocation[] = selectedCategories.map(categoryId => ({
          categoryId,
          finalAmount: baseAmount,
        }));
        
        // 잔여 예산을 앞에서부터 천원씩 추가
        const allocated = baseAmount * selectedCategories.length;
        let remain = availableBudget - allocated;
        let idx = 0;
        while (remain >= 1000 && idx < fallbackAllocations.length) {
          fallbackAllocations[idx].finalAmount += 1000;
          remain -= 1000;
          idx++;
        }
        
        updateCategorySelection(selectedCategories, fallbackAllocations);
      }).finally(() => {
        setIsLoadingAI(false);
      });
    }
  }, [selectedCategories.length, availableBudget, categoryAllocations.length]);

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
    
    if (categoryAllocations.length > 0) {
    } else {
    }
  }, [selectedCategories, categoryAllocations, availableBudget, version, items]);

  // amount 변경 (Context 직접 업데이트)
  const onChangeItem = useCallback((name: CategoryName, next: number) => {
    
    const categoryId = getCategoryId(name);
    const newAllocations = categoryAllocations.map(allocation => 
      allocation.categoryId === categoryId 
        ? { ...allocation, finalAmount: next }
        : allocation
    );
    
    
    // Context 업데이트 (사용자 수정사항 저장)
    updateCategorySelection(selectedCategories, newAllocations);
  }, [categoryAllocations, selectedCategories, updateCategorySelection]);

  // 네비게이션
  const goPrev = useCallback(() => router.back(), []);

  // 예산 합계 검증
  const isBudgetValid = useMemo(() => {
    const totalAllocated = categoryAllocations.reduce((sum, allocation) => sum + allocation.finalAmount, 0);
    const isValid = totalAllocated === availableBudget;
    
    
    return isValid;
  }, [categoryAllocations, availableBudget]);

  const goNext = useCallback(async () => {
    // 예산 합계 검증
    if (!isBudgetValid) {
      // TODO: 사용자에게 알림 표시 (토스트 메시지 등)
      return;
    }

    
    try {
      const result = await saveCategories(selectedCategories, categoryAllocations);
      if (result) {
      }
      
      router.push("/budget/summary");
    } catch (error) {
      // TODO: 사용자에게 에러 알림 표시 (토스트 메시지 등)
    }
  }, [selectedCategories, categoryAllocations, saveCategories, version, isBudgetValid, availableBudget]);

  return (
    <>
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
        aiRecommendationSuccess={aiRecommendationSuccess}
      />
      
      <LoadingOverlay
        visible={isLoadingAI || isSavingCategories}
        message={isLoadingAI ? "AI가 예산을 추천하고 있어요..." : "카테고리 예산 저장 중..."}
      />
    </>
  );
}
