import { useState } from "react";
import TotalBudgetTemplate from "~features/Budget/templates/TotalBudgetTemplate";
import { router } from "expo-router";

export default function TotalBudgetInputScreen() {
  const [amount, setAmount] = useState(500_000);

  const goPrev = () => router.back();
  const goNext = () => {
    router.push({
      pathname: "/budget/fixed-expense",
      params: { totalAmount: amount.toString() }
    });
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
