import { useRouter } from "expo-router";
import React, { useState } from "react";
import { SafeAreaView, Alert } from "react-native";
import LoginTemplate from "~features/Auth/templates/LoginTemplate";
import { useEmailLogin, useKakaoLogin } from "../model/useAuthQueries";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(true);

  const emailLoginMutation = useEmailLogin();
  const kakaoLoginMutation = useKakaoLogin();

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
      
      // 로그인 성공 시 홈 화면으로 이동
      router.replace("/(tabs)/home");
    } catch (error: any) {
      console.error("로그인 실패:", error);
      Alert.alert(
        "로그인 실패",
        error?.response?.data?.message || "이메일 또는 비밀번호가 올바르지 않습니다."
      );
    }
  };

  // 카카오 로그인 처리
  const handleKakaoLogin = async () => {
    try {
      // TODO: 카카오 로그인 SDK 연동
      // const kakaoAccessToken = await getKakaoAccessToken();
      // await kakaoLoginMutation.mutateAsync(kakaoAccessToken);
      
      Alert.alert("알림", "카카오 로그인은 준비 중입니다.");
    } catch (error: any) {
      console.error("카카오 로그인 실패:", error);
      Alert.alert("로그인 실패", "카카오 로그인 중 오류가 발생했습니다.");
    }
  };

  // 비밀번호 토글
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

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
