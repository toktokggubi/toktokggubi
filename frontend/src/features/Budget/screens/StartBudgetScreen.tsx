import React, { useState } from "react";
import { useRouter } from "expo-router";
import BudgetIntroTemplate from "~features/Budget/templates/BudgetIntroTemplate";

export default function StartBugetScreen() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const goNext = () => {
    if (isNavigating) return; // 중복 네비 방지
    setIsNavigating(true);

    // 아직 /budget/next 라우트 없음 → 임시로 콘솔만 찍어두기
    // 나중에 페이지 만들면 아래 주석 해제
    // router.push("/budget/next");

    console.log("다음 페이지로 이동 예정 (라우트 연결 대기중)");
  };

  return <BudgetIntroTemplate onNext={goNext} nextDisabled={isNavigating} />;
}
