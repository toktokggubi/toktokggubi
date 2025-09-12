import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import FixedExpenseTemplate from "~features/Budget/templates/FixedExpenseTemplate";
import type { FixedExpenseItem } from "~features/Budget/ui/molecules/FixedExpenseRow/types";
import type { AddFixedExpenseFormValues } from "~features/Budget/ui/forms/AddFixedExpenseForm/types";

export default function FixedExpenseScreen() {
  // 이전 단계에서 받은 총 예산
  const { totalAmount } = useLocalSearchParams<{ totalAmount: string }>();
  const totalBudget = totalAmount ? parseInt(totalAmount) : 1000000;

  // 고정 지출 리스트 상태
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
    router.push("/budget/select-category");
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
