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
    
    updateTotalAmount(amount);
    const result = await saveTotalMutation.mutateAsync({ totalAmount: amount });
    
    
    return result;
  }, [saveTotalMutation, updateTotalAmount, version, draftId]);

  const saveFixed = useCallback(async (expenses: FixedExpense[]) => {
    
    updateFixedExpenses(expenses);
    
    // 버전이 0이면 null로 보내서 서버에서 처리하도록 함
    const expectedVersion = version > 0 ? version : null;
    
    const result = await saveFixedMutation.mutateAsync({
      expectedVersion: expectedVersion as any, // 타입 에러 방지
      fixedExpenses: expenses,
    });
    
    
    return result;
  }, [saveFixedMutation, version, updateFixedExpenses, draftId]);

  const saveCategories = useCallback(async (categories: number[], allocations: CategoryAllocation[]) => {
    
    updateCategorySelection(categories, allocations);
    
    const expectedVersion = version > 0 ? version : null;
    
    const result = await saveCategoriesMutation.mutateAsync({
      expectedVersion: expectedVersion as any,
      selectedCategories: categories,
      categoryAllocations: allocations,
    });
    
    
    return result;
  }, [saveCategoriesMutation, version, updateCategorySelection, draftId]);

  const commit = useCallback(async () => {
    
    const result = await commitMutation.mutateAsync();
    
    
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
