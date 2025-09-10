// src/features/Budget/screens/TotalBudgetInputScreen/TotalBudgetInputScreen.tsx
import { useState } from "react";
import TotalBudgetTemplate from "~features/Budget/templates/TotalBudgetTemplate";
import { router } from "expo-router"; // 라우트 넣을 때 사용

export default function TotalBudgetInputScreen() {
  const [amount, setAmount] = useState(500_000);

  const goPrev = () => router.back();
  const goNext = () => {
    // TODO: 다음 페이지 만든 후 경로 연결
    // router.push("/budget/category-select");
    // 아직 /budget/next 라우트 없음 → 임시로 콘솔만 찍어두기

    console.log("다음 페이지로 이동 예정 (라우트 연결 대기중)");
  };

  return (
    <TotalBudgetTemplate
      amount={amount}
      onChangeAmount={setAmount}
      onPressPrev={goPrev}
      onPressNext={goNext}
      nextDisabled={amount <= 0}
    />
  );
}
