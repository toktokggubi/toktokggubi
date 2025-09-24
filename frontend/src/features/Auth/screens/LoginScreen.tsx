import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { SafeAreaView, Alert } from "react-native";
import LoginTemplate from "~features/Auth/templates/LoginTemplate";
import { useEmailLogin, useKakaoLogin } from "../model/useAuthQueries";
import { useBudgetStatusQuery } from "~features/Budget/model/useBudgetStatusQuery";
import { hasValidToken } from "@/shared/utils/currency";
import KakaoAuthService from "@/shared/services/kakaoAuthService";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  const emailLoginMutation = useEmailLogin();
  const kakaoLoginMutation = useKakaoLogin();
  const budgetStatusQuery = useBudgetStatusQuery();

  // 토큰 확인 및 자동 리다이렉트
  useEffect(() => {
    const checkTokenAndRedirect = async () => {
      try {
        const hasToken = await hasValidToken();
        if (hasToken) {
          // 토큰이 있으면 홈으로 리다이렉트
          router.replace("/(tabs)/home");
        }
      } catch (error) {
      } finally {
        setIsCheckingToken(false);
      }
    };

    checkTokenAndRedirect();
  }, [router]);

  // 이메일 로그인 처리
  const handleEmailLogin = async () => {
    if (!email.trim()) {
      Alert.alert("알림", "이메일을 입력해주세요.");
      return;
    }
    if (!password.trim()) {
      Alert.alert("알림", "비밀번호를 입력해주세요.");
      return;
    }

    try {
      await emailLoginMutation.mutateAsync({
        email: email.trim(),
        password: password.trim(),
      });
      
      // 로그인 성공 후 예산 설정 여부 확인
      try {
        await budgetStatusQuery.refetch();
        // 예산이 설정되어 있으면 홈으로 이동
        router.replace("/(tabs)/home");
      } catch (budgetError: any) {
        // 예산이 설정되지 않았으면 예산 소개 화면으로 이동
        if (budgetError?.message === 'BUDGET_NOT_SET' || budgetError?.message === 'BUDGET_NOT_FOUND') {
          router.replace("/budget");
        } else {
          // 예산 확인 실패 시에도 홈으로 이동 (fallback)
          router.replace("/(tabs)/home");
        }
      }
    } catch (error: any) {
      Alert.alert(
        "로그인 실패",
        error?.response?.data?.message || "이메일 또는 비밀번호가 올바르지 않습니다."
      );
    }
  };

  // 카카오 로그인 처리
  const handleKakaoLogin = async () => {
    try {
      // 카카오 로그인 서비스 인스턴스 가져오기
      const kakaoAuthService = KakaoAuthService.getInstance();
      
      // 카카오 로그인 실행하여 액세스 토큰 획득
      const kakaoAccessToken = await kakaoAuthService.login();
      
      // 서버에 카카오 액세스 토큰 전송하여 로그인 처리
      await kakaoLoginMutation.mutateAsync(kakaoAccessToken);
      
      // 로그인 성공 후 예산 설정 여부 확인
      try {
        await budgetStatusQuery.refetch();
        // 예산이 설정되어 있으면 홈으로 이동
        router.replace("/(tabs)/home");
      } catch (budgetError: any) {
        // 예산이 설정되지 않았으면 예산 소개 화면으로 이동
        if (budgetError?.message === 'BUDGET_NOT_SET' || budgetError?.message === 'BUDGET_NOT_FOUND') {
          router.replace("/budget");
        } else {
          // 예산 확인 실패 시에도 홈으로 이동 (fallback)
          router.replace("/(tabs)/home");
        }
      }
    } catch (error: any) {
      console.error('카카오 로그인 오류:', error);
      
      // 사용자가 취소한 경우는 별도 처리
      if (error.message === '사용자가 로그인을 취소했습니다.') {
        return; // 알림 없이 조용히 처리
      }
      
      Alert.alert(
        "로그인 실패", 
        error?.response?.data?.message || error.message || "카카오 로그인 중 오류가 발생했습니다."
      );
    }
  };

  // 비밀번호 토글
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  // 토큰 확인 중일 때는 로딩 표시
  if (isCheckingToken) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff", justifyContent: "center", alignItems: "center" }}>
        {/* 로딩 인디케이터나 스피너를 여기에 추가할 수 있습니다 */}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <LoginTemplate
        id={email}
        password={password}
        onChangeId={setEmail}
        onChangePassword={setPassword}
        onSubmit={handleEmailLogin}
        onNavigateSignUp={() => router.push("/auth/signup")}
        errorMessage={undefined}
        headerImageSource={require("@/assets/images/character/big-character-01.png")}
        showSocialLogin
        onPressKakao={handleKakaoLogin}
        passwordToggle={passwordVisible}
        onTogglePassword={togglePasswordVisibility}
        submitting={emailLoginMutation.isPending || kakaoLoginMutation.isPending}
        disabled={emailLoginMutation.isPending || kakaoLoginMutation.isPending}
      />
    </SafeAreaView>
  );
}
