import { useEffect, useState } from "react";
import { router } from "expo-router";
import { View, ActivityIndicator, Text } from "react-native";
import { hasValidToken } from "@/shared/utils/currency";
import { useBudgetStatusQuery } from "@/features/Budget/model/useBudgetStatusQuery";

export default function IndexScreen() {
  const [isChecking, setIsChecking] = useState(true);
  const budgetStatusQuery = useBudgetStatusQuery();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        // 토큰 존재 여부 확인
        const hasToken = await hasValidToken();

        if (hasToken) {
          // 토큰이 있으면 예산 설정 여부 확인
          try {
            await budgetStatusQuery.refetch();
            // 예산이 설정되어 있으면 홈으로 이동
            router.replace("/(tabs)/home");
          } catch (budgetError: any) {
            // 예산이 설정되지 않았으면 예산 소개 화면으로 이동
            if (
              budgetError?.message === "BUDGET_NOT_SET" ||
              budgetError?.message === "BUDGET_NOT_FOUND"
            ) {
              router.replace("/budget");
            } else {
              // 예산 확인 실패 시에도 홈으로 이동 (fallback)
              router.replace("/(tabs)/home");
            }
          }
        } else {
          // 토큰이 없으면 로그인 페이지로 이동
          router.replace("/auth/login");
        }
      } catch (error) {
        console.error("초기 인증 확인 중 오류:", error);
        // 오류 발생 시 로그인 페이지로 이동
        router.replace("/auth/login");
      } finally {
        setIsChecking(false);
      }
    };

    checkAuthAndRedirect();
  }, []);

  // 로딩 중일 때 표시할 화면
  if (isChecking) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color="#007AFF" />
        <Text
          style={{
            marginTop: 16,
            fontSize: 16,
            color: "#666",
            fontFamily: "NotoSansKR_Regular",
          }}
        >
          앱을 시작하는 중...
        </Text>
      </View>
    );
  }

  // 이 부분은 실행되지 않지만, 타입스크립트 오류 방지를 위해 추가
  return null;
}
