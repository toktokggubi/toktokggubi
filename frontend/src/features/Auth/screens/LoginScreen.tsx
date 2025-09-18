import { useRouter } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native";
import LoginTemplate from "~features/Auth/templates/LoginTemplate";
import { useEmailLogin, useKakaoLogin } from "../model/useAuthQueries";
import { useBudgetStatusQuery } from "~features/Budget/model/useBudgetStatusQuery";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  const emailLoginMutation = useEmailLogin();
  const kakaoLoginMutation = useKakaoLogin();
  const budgetStatusQuery = useBudgetStatusQuery();

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
        if (
          budgetError?.message === "BUDGET_NOT_SET" ||
          budgetError?.message === "BUDGET_NOT_FOUND"
        ) {
          router.replace("/budget");
        } else {
          console.error("예산 상태 확인 실패:", budgetError);
          // 예산 확인 실패 시에도 홈으로 이동 (fallback)
          router.replace("/(tabs)/home");
        }
      }
    } catch (error: any) {
      console.error("로그인 실패:", error);
      Alert.alert(
        "로그인 실패",
        error?.response?.data?.message ||
          "이메일 또는 비밀번호가 올바르지 않습니다."
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
        id={id}
        password={pw}
        onChangeId={setId}
        onChangePassword={setPw}
        onSubmit={() => {
          /* mutate/login 로직 */
        }}
        onNavigateSignUp={() => router.push("/auth/signup")}
        errorMessage={undefined}
        headerImageSource={require("@/assets/images/character/big-character-01.png")}
        showSocialLogin
        onPressKakao={() => {
          /* 카카오 로그인 로직 */
        }}
      />
    </SafeAreaView>
  );
}
