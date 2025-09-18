import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import FixedExpenseTemplate from "~features/Budget/templates/FixedExpenseTemplate";
import type { FixedExpenseItem } from "~features/Budget/ui/molecules/FixedExpenseRow/types";
import type { AddFixedExpenseFormValues } from "~features/Budget/ui/forms/AddFixedExpenseForm/types";

// 🔄 REDIS 전환 시 수정할 부분들:
// 1. import 추가: useBudgetDraftQuery, useSaveFixedExpensesMutation, useBudgetDraftFormData, useBudgetDraftActions, useBudgetDraftCalculations, useBudgetDraftData
// 2. useLocalSearchParams 제거하고 draft store에서 데이터 가져오기
// 3. 로컬 상태(items) 대신 draft store 사용
// 4. goNext에서 파라미터 전달 대신 Redis 저장 후 네비게이션

export default function FixedExpenseScreen() {
  // 🔄 REDIS 전환 시: 이 부분을 draft store에서 가져오도록 변경
  // const { totalAmount } = useBudgetDraftFormData();
  // const { updateFixedExpenses } = useBudgetDraftActions();
  // const { getAvailableBudget } = useBudgetDraftCalculations();
  // const { version } = useBudgetDraftData();
  // const saveFixedMutation = useSaveFixedExpensesMutation();
  
  // 현재: 파라미터로 받은 총 예산
  const { totalAmount } = useLocalSearchParams<{ totalAmount: string }>();
  const totalBudget = totalAmount ? parseInt(totalAmount) : 1000000;

  // 🔄 REDIS 전환 시: 로컬 상태 대신 draft store 사용
  // const [localItems, setLocalItems] = useState<FixedExpenseItem[]>([]);
  // const [isInitialized, setIsInitialized] = useState(false);
  // const { data: draftData } = useBudgetDraftQuery();
  
  // 현재: 로컬 상태로 고정 지출 관리
  const [items, setItems] = useState<FixedExpenseItem[]>([]);

  // 폼(모달) 상태
  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<FixedExpenseItem | undefined>(undefined);

  // 포함된 고정지출 합계
  const sumIncluded = items
    .filter((i) => i.includeInBudget)
    .reduce((acc, cur) => acc + cur.amount, 0);

  // 다음 달 사용 가능 예산 (이전 단계에서 받은 총 예산 - 포함된 고정지출)
  const availableNextMonth = totalBudget - sumIncluded;

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

  const submitForm = (v: AddFixedExpenseFormValues) => {
    if (editing) {
      setItems((prev) =>
        prev.map((i) => (i.id === editing.id ? { ...editing, ...v } : i))
      );
    } else {
      setItems((prev) => [...prev, { id: String(Date.now()), ...v }]);
    }
    setFormVisible(false);
  };

  // 네비게이션
  const goPrev = () => router.back();
  const goNext = () => {
    // 🔄 REDIS 전환 시: 파라미터 전달 대신 Redis 저장 후 네비게이션
    // const expenses = items.map((item: FixedExpenseItem) => ({
    //   title: item.name,
    //   amount: item.amount,
    //   payDay: item.billingDay || 1,
    //   includeInBudget: item.includeInBudget,
    // }));
    // 
    // if (version && version > 0) {
    //   saveFixedMutation.mutate({
    //     expectedVersion: version,
    //     fixedExpenses: expenses,
    //   }, {
    //     onSuccess: () => {
    //       router.push("/budget/select-category");
    //     },
    //     onError: (error) => {
    //       console.error('저장 실패:', error);
    //     },
    //   });
    // } else {
    //   router.push("/budget/select-category");
    // }
    
    // 현재: 파라미터로 고정 지출 데이터 전달
    const fixedExpensesParam = encodeURIComponent(JSON.stringify(items));
    router.push({
      pathname: "/budget/select-category",
      params: { 
        totalAmount: totalAmount,
        fixedExpenses: fixedExpensesParam
      }
    });
  };

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
      // 안내 텍스트
      availableNextMonth={availableNextMonth}
      // 푸터
      stepIndex={1}
      stepTotal={5}
      onPressPrev={goPrev}
      onPressNext={goNext}
      nextDisabled={availableNextMonth < 0}
    />
  );
}
