import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import BudgetIntroTemplate from "@/features/Budget/templates/IntroBudgetTemplate";

export default function StartBugetScreen() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  // 컴포넌트가 마운트될 때마다 네비게이션 상태 초기화
  useEffect(() => {
    setIsNavigating(false);
  }, []);

  const goNext = () => {
    if (isNavigating) return; // 중복 네비 방지
    setIsNavigating(true);
    router.push("/budget/total");

    // 네비게이션 후 일정 시간 후 상태 초기화 (안전장치)
    setTimeout(() => {
      setIsNavigating(false);
    }, 1000);
  };

  return (
    <BudgetIntroTemplate
      onNext={goNext}
      nextDisabled={isNavigating}
      mascotSource={require("@/assets/images/character/big-character-01.png")}
    />
  );
}
