import React, { useState } from "react";
import { useRouter } from "expo-router";
import BudgetIntroTemplate from "~features/Budget/templates/BudgetIntroTemplate";

export default function StartBugetScreen() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const goNext = () => {
    if (isNavigating) return; // 중복 네비 방지
    setIsNavigating(true);
    router.push("/budget/total");
  };

  return <BudgetIntroTemplate onNext={goNext} nextDisabled={isNavigating} />;
}
