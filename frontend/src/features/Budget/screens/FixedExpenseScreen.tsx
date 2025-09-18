import { useState, useEffect, useMemo, useCallback } from "react";
import { router } from "expo-router";
import FixedExpenseTemplate from "~features/Budget/templates/FixedExpenseTemplate";
import { useBudgetDraft } from "~features/Budget/context/BudgetDraftContext";
import type { FixedExpenseItem } from "~features/Budget/ui/molecules/FixedExpenseRow/types";
import type { AddFixedExpenseFormValues } from "~features/Budget/ui/forms/AddFixedExpenseForm/types";

export default function FixedExpenseScreen() {
  const { 
    totalAmount, 
    saveFixed, 
    availableBudget, // Context에서 계산된 사용 가능 예산 사용
    version, 
    isSavingFixed, 
    fixedError,
    fixedExpenses,
    updateFixedExpenses,
    loadDraftData 
  } = useBudgetDraft();

  // Context에서 직접 고정지출 데이터를 계산 (로컬 상태 제거)
  const items: FixedExpenseItem[] = useMemo(() => {
    return fixedExpenses.map((expense, index) => ({
      id: String(index),
      name: expense.title,
      amount: expense.amount,
      includeInBudget: expense.includeInBudget,
      billingDay: expense.payDay,
    }));
  }, [fixedExpenses]);

  // 데이터 로딩
  useEffect(() => {
    console.log('=== FixedExpenseScreen 데이터 로딩 ===');
    console.log('fixedExpenses:', fixedExpenses);
    console.log('fixedExpenses.length:', fixedExpenses.length);
    console.log('items:', items);
    
    loadDraftData();
  }, [loadDraftData]);

  // 폼(모달) 상태
  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<FixedExpenseItem | undefined>(undefined);

  // 이벤트 핸들러
  const openCreate = () => {
    setEditing(undefined);
    setFormVisible(true);
  };
  
  const openEdit = (it: FixedExpenseItem) => {
    setEditing(it);
    setFormVisible(true);
  };
  
  const closeForm = () => setFormVisible(false);

  const submitForm = useCallback((v: AddFixedExpenseFormValues) => {
    console.log('=== 고정지출 폼 제출 ===');
    console.log('편집 중인 항목:', editing);
    console.log('입력값:', v);
    
    let newExpenses;
    
    if (editing) {
      // 편집 모드
      const editingIndex = parseInt(editing.id);
      newExpenses = fixedExpenses.map((expense, index) => 
        index === editingIndex 
          ? {
              title: v.name,
              amount: v.amount,
              payDay: v.billingDay || 1,
              includeInBudget: v.includeInBudget,
            }
          : expense
      );
    } else {
      // 추가 모드
      newExpenses = [
        ...fixedExpenses,
        {
          title: v.name,
          amount: v.amount,
          payDay: v.billingDay || 1,
          includeInBudget: v.includeInBudget,
        }
      ];
    }
    
    console.log('새로운 고정지출:', newExpenses);
    updateFixedExpenses(newExpenses);
    setFormVisible(false);
  }, [editing, fixedExpenses, updateFixedExpenses]);

  // 네비게이션
  const goPrev = () => router.back();
  
  const goNext = useCallback(async () => {
    console.log('=== 고정지출 저장 시작 ===');
    console.log('Context fixedExpenses:', fixedExpenses);
    console.log('현재 버전:', version);
    
    try {
      const result = await saveFixed(fixedExpenses);
      console.log('=== 고정지출 저장 성공 ===');
      console.log('저장 결과:', result);
      if (result) {
        console.log('새로운 버전:', result.version);
        console.log('새로운 draftId:', result.draftId);
      }
      
      router.push("/budget/select-category");
    } catch (error) {
      console.error('=== 고정지출 저장 실패 ===');
      console.error('에러:', error);
      // 에러 처리 (토스트 메시지 등)
    }
  }, [fixedExpenses, saveFixed, version]);

  return (
    <FixedExpenseTemplate
      // 상단 카피
      title="고정 지출 설정"
      subtitle="고정적으로 나가는 지출이 있나요?"
      // 리스트
      items={items}
      onPressItem={openEdit}
      onPressAdd={openCreate}
      // 폼 모달
      formVisible={formVisible}
      formMode={editing ? "edit" : "create"}
      formDefaultValues={editing}
      onSubmitForm={submitForm}
      onCancelForm={closeForm}
      // 안내 텍스트 (이번 달 사용 가능 예산)
      availableNextMonth={availableBudget}
      // 푸터
      stepIndex={1}
      stepTotal={5}
      onPressPrev={goPrev}
      onPressNext={goNext}
      nextDisabled={availableBudget < 0 || isSavingFixed}
    />
  );
}
