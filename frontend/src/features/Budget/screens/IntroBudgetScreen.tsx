import BudgetIntroTemplate from "@/features/Budget/templates/IntroBudgetTemplate";
import { useAuthGuard } from "@/shared/hooks/useAuthGuard";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { BackHandler } from "react-native";
import { fetchPreviousBudget } from "@/features/Budget/api/ai-fetchers";

export default function StartBugetScreen() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isCheckingPreviousBudget, setIsCheckingPreviousBudget] = useState(true);

  // 인증 가드
  const { isAuthenticated, isLoading: authLoading } = useAuthGuard();

  // 컴포넌트가 마운트될 때마다 네비게이션 상태 초기화 및 이전 달 예산 확인
  useEffect(() => {
    setIsNavigating(false);
    checkPreviousBudget();
  }, []);

  // 이전 달 예산 존재 여부 확인
  const checkPreviousBudget = async () => {
    try {
      setIsCheckingPreviousBudget(true);
      await fetchPreviousBudget();
      // 이전 달 예산이 있으면 기존 예산 설정 과정으로 이동
      router.replace("/budget/total");
    } catch (error) {
      // 이전 달 예산이 없으면 Redis 기반 플로우로 이동 (total 페이지부터 시작)
      console.log("이전 달 예산이 없습니다. Redis 기반 플로우로 진행합니다.");
      // 여기서는 그대로 두고 사용자가 버튼을 눌렀을 때 이동하도록 함
    } finally {
      setIsCheckingPreviousBudget(false);
    }
  };

  // 시스템 뒤로가기 버튼 처리
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // 홈으로 이동
        router.push("/(tabs)/home");
        return true; // 기본 뒤로가기 동작 방지
      };

      // 뒤로가기 이벤트 리스너 등록
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

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

  // 이전 달 예산 확인 중인 경우
  if (isCheckingPreviousBudget) {
    return (
      <BudgetIntroTemplate
        onNext={() => {}}
        nextDisabled={true}
        mascotSource={require("@/assets/images/character/character_jump_paticle.gif")}
      />
    );
  }

  return (
    <BudgetIntroTemplate
      onNext={goNext}
      nextDisabled={isNavigating}
      mascotSource={require("@/assets/images/character/character_jump_paticle.gif")}
    />
  );
}
