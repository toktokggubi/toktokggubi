import React, { createContext, useContext, useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { 
  saveDraftTotal, 
  saveDraftFixed, 
  saveDraftCategories, 
  commitBudget 
} from '../api/fetchers';
import type { 
  FixedExpense, 
  CategoryAllocation, 
  DraftSaveResponse, 
  BudgetCommitResponse 
} from '../types/budget.types';

// Context 타입 정의
interface BudgetDraftContextType {
  // 상태
  totalAmount: number | null;
  fixedExpenses: FixedExpense[];
  selectedCategories: number[];
  categoryAllocations: CategoryAllocation[];
  version: number;
  draftId: string | null;
  
  // 계산된 값
  includedFixedSum: number;
  availableBudget: number;
  categoryBudgetSum: number;
  
  // 액션
  updateTotalAmount: (amount: number) => void;
  updateFixedExpenses: (expenses: FixedExpense[]) => void;
  updateCategorySelection: (categories: number[], allocations: CategoryAllocation[]) => void;
  saveTotal: (amount: number) => Promise<DraftSaveResponse>;
  saveFixed: (expenses: FixedExpense[]) => Promise<DraftSaveResponse | void>;
  saveCategories: (categories: number[], allocations: CategoryAllocation[]) => Promise<DraftSaveResponse | void>;
  commit: () => Promise<BudgetCommitResponse>;
  loadDraftData: () => void;
  
  // 뮤테이션 상태
  isSavingTotal: boolean;
  isSavingFixed: boolean;
  isSavingCategories: boolean;
  isCommitting: boolean;
  
  // 에러
  totalError: any;
  fixedError: any;
  categoriesError: any;
  commitError: any;
}

// Context 생성
const BudgetDraftContext = createContext<BudgetDraftContextType | undefined>(undefined);

// Provider 컴포넌트
export function BudgetDraftProvider({ children }: { children: React.ReactNode }) {
  const [totalAmount, setTotalAmount] = useState<number | null>(null);
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [categoryAllocations, setCategoryAllocations] = useState<CategoryAllocation[]>([]);
  const [version, setVersion] = useState<number>(0);
  const [draftId, setDraftId] = useState<string | null>(null);

  // 총예산 저장
  const saveTotalMutation = useMutation({
    mutationFn: saveDraftTotal,
    onSuccess: (data: DraftSaveResponse) => {
      setVersion(data.version);
      setDraftId(data.draftId);
    },
  });

  // 고정지출 저장
  const saveFixedMutation = useMutation({
    mutationFn: saveDraftFixed,
    onSuccess: (data: DraftSaveResponse) => {
      setVersion(data.version);
      setDraftId(data.draftId);
    },
  });

  // 카테고리 저장
  const saveCategoriesMutation = useMutation({
    mutationFn: saveDraftCategories,
    onSuccess: (data: DraftSaveResponse) => {
      setVersion(data.version);
      setDraftId(data.draftId);
    },
  });

  // 예산 확정
  const commitMutation = useMutation({
    mutationFn: commitBudget,
  });

  // 액션들
  const updateTotalAmount = useCallback((amount: number) => {
    setTotalAmount(amount);
  }, []);

  const updateFixedExpenses = useCallback((expenses: FixedExpense[]) => {
    setFixedExpenses(expenses);
  }, []);

  const updateCategorySelection = useCallback((categories: number[], allocations: CategoryAllocation[]) => {
    setSelectedCategories(categories);
    setCategoryAllocations(allocations);
  }, []);

  // 이전 단계로 돌아갈 때 데이터 로딩
  const loadDraftData = useCallback(() => {
    // 데이터 로딩 로직 (필요시 구현)
  }, []);

  const saveTotal = useCallback(async (amount: number) => {
    console.log('=== Context saveTotal 호출 ===');
    console.log('저장할 총예산:', amount);
    console.log('현재 버전:', version);
    console.log('현재 draftId:', draftId);
    
    updateTotalAmount(amount);
    const result = await saveTotalMutation.mutateAsync({ totalAmount: amount });
    
    console.log('=== Context saveTotal 완료 ===');
    console.log('새로운 버전:', result.version);
    console.log('새로운 draftId:', result.draftId);
    console.log('TTL (초):', result.ttlSeconds);
    
    return result;
  }, [saveTotalMutation, updateTotalAmount, version, draftId]);

  const saveFixed = useCallback(async (expenses: FixedExpense[]) => {
    console.log('=== Context saveFixed 호출 ===');
    console.log('저장할 고정지출:', expenses);
    console.log('현재 버전:', version);
    console.log('현재 draftId:', draftId);
    
    updateFixedExpenses(expenses);
    
    // 버전이 0이면 null로 보내서 서버에서 처리하도록 함
    const expectedVersion = version > 0 ? version : null;
    console.log('전송할 expectedVersion:', expectedVersion);
    
    const result = await saveFixedMutation.mutateAsync({
      expectedVersion: expectedVersion as any, // 타입 에러 방지
      fixedExpenses: expenses,
    });
    
    console.log('=== Context saveFixed 완료 ===');
    console.log('새로운 버전:', result.version);
    console.log('새로운 draftId:', result.draftId);
    console.log('TTL (초):', result.ttlSeconds);
    
    return result;
  }, [saveFixedMutation, version, updateFixedExpenses, draftId]);

  const saveCategories = useCallback(async (categories: number[], allocations: CategoryAllocation[]) => {
    console.log('=== Context saveCategories 호출 ===');
    console.log('저장할 카테고리 IDs:', categories);
    console.log('저장할 할당:', allocations);
    console.log('현재 버전:', version);
    console.log('현재 draftId:', draftId);
    
    updateCategorySelection(categories, allocations);
    
    const expectedVersion = version > 0 ? version : null;
    console.log('전송할 expectedVersion:', expectedVersion);
    
    const result = await saveCategoriesMutation.mutateAsync({
      expectedVersion: expectedVersion as any,
      selectedCategories: categories,
      categoryAllocations: allocations,
    });
    
    console.log('=== Context saveCategories 완료 ===');
    console.log('새로운 버전:', result.version);
    console.log('새로운 draftId:', result.draftId);
    console.log('TTL (초):', result.ttlSeconds);
    
    return result;
  }, [saveCategoriesMutation, version, updateCategorySelection, draftId]);

  const commit = useCallback(async () => {
    console.log('=== Context commit 호출 ===');
    console.log('현재 버전:', version);
    console.log('현재 draftId:', draftId);
    console.log('최종 총예산:', totalAmount);
    console.log('최종 고정지출:', fixedExpenses);
    console.log('최종 카테고리 할당:', categoryAllocations);
    
    const result = await commitMutation.mutateAsync();
    
    console.log('=== Context commit 완료 ===');
    console.log('확정 결과:', result);
    console.log('사용자 ID:', result.userId);
    console.log('예산 년월:', result.budgetYm);
    console.log('총 금액:', result.totalAmount);
    console.log('확정 여부:', result.isFinalized);
    console.log('카테고리 수:', result.categories.length);
    
    return result;
  }, [commitMutation, version, draftId, totalAmount, fixedExpenses, categoryAllocations]);

  // 계산된 값들
  const includedFixedSum = fixedExpenses
    .filter(expense => expense.includeInBudget)
    .reduce((sum, expense) => sum + expense.amount, 0);

  const availableBudget = totalAmount ? totalAmount - includedFixedSum : 0;

  const categoryBudgetSum = categoryAllocations
    .reduce((sum, allocation) => sum + allocation.finalAmount, 0);

  const value: BudgetDraftContextType = {
    // 상태
    totalAmount,
    fixedExpenses,
    selectedCategories,
    categoryAllocations,
    version,
    draftId,
    
    // 계산된 값
    includedFixedSum,
    availableBudget,
    categoryBudgetSum,
    
    // 액션
    updateTotalAmount,
    updateFixedExpenses,
    updateCategorySelection,
    saveTotal,
    saveFixed,
    saveCategories,
    commit,
    loadDraftData,
    
    // 뮤테이션 상태
    isSavingTotal: saveTotalMutation.isPending,
    isSavingFixed: saveFixedMutation.isPending,
    isSavingCategories: saveCategoriesMutation.isPending,
    isCommitting: commitMutation.isPending,
    
    // 에러
    totalError: saveTotalMutation.error,
    fixedError: saveFixedMutation.error,
    categoriesError: saveCategoriesMutation.error,
    commitError: commitMutation.error,
  };

  return (
    <BudgetDraftContext.Provider value={value}>
      {children}
    </BudgetDraftContext.Provider>
  );
}

// Hook
export function useBudgetDraft() {
  const context = useContext(BudgetDraftContext);
  if (context === undefined) {
    throw new Error('useBudgetDraft must be used within a BudgetDraftProvider');
  }
  return context;
}
