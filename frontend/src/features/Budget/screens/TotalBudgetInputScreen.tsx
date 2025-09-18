import { useState, useEffect } from "react";
import { router } from "expo-router";
import TotalBudgetTemplate from "~features/Budget/templates/TotalBudgetTemplate";
import { useBudgetDraft } from "~features/Budget/context/BudgetDraftContext";

export default function TotalBudgetInputScreen() {
  const [totalAmount, setTotalAmount] = useState(500_000); // 기본값을 500,000으로 설정
  const { 
    saveTotal, 
    isSavingTotal, 
    totalError, 
    totalAmount: contextTotalAmount, 
    version, 
    draftId,
    loadDraftData 
  } = useBudgetDraft();

  // 이전에 저장된 총예산 데이터가 있으면 불러오기
  useEffect(() => {
    loadDraftData();
    if (contextTotalAmount) {
      setTotalAmount(contextTotalAmount);
    }
  }, [contextTotalAmount, loadDraftData]);

  const goPrev = () => router.push("/(tabs)/home");
  
  const goNext = async () => {
    try {
      await saveTotal(totalAmount);
      router.push("/budget/fixed-expense");
    } catch (error) {
      console.error('총예산 저장 실패:', error);
      // 에러 처리 (토스트 메시지 등)
    }
  };

  return (
    <TotalBudgetTemplate
      amount={totalAmount}
      onChangeAmount={setTotalAmount}
      onPressPrev={goPrev}
      onPressNext={goNext}
      nextDisabled={totalAmount <= 0 || isSavingTotal}
    />
  );
}
