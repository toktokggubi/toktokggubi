import React, { useState, useEffect } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import { BackHandler } from "react-native";
import BudgetIntroTemplate from "@/features/Budget/templates/IntroBudgetTemplate";
import { useAuthGuard } from "@/shared/hooks/useAuthGuard";

export default function StartBugetScreen() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  
  // 인증 가드
  const { isAuthenticated, isLoading: authLoading } = useAuthGuard();

  // 컴포넌트가 마운트될 때마다 네비게이션 상태 초기화
  useEffect(() => {
    setIsNavigating(false);
  }, []);

  // 시스템 뒤로가기 버튼 처리
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // 홈으로 이동
        router.push("/(tabs)/home");
        return true; // 기본 뒤로가기 동작 방지
      };

      // 뒤로가기 이벤트 리스너 등록
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => subscription.remove();
    }, [router])
  );

  const goNext = () => {
    if (isNavigating) return; // 중복 네비 방지
    setIsNavigating(true);
    router.push("/budget/total");

    // 네비게이션 후 일정 시간 후 상태 초기화 (안전장치)
    setTimeout(() => {
      setIsNavigating(false);
    }, 1000);
  };

  // 인증 로딩 중이거나 인증되지 않은 경우
  if (authLoading || !isAuthenticated) {
    return null; // useAuthGuard에서 자동으로 리다이렉트됨
  }

  return (
    <BudgetIntroTemplate
      onNext={goNext}
      nextDisabled={isNavigating}
      mascotSource={require("@/assets/images/character/big-character-01.png")}
    />
  );
}
