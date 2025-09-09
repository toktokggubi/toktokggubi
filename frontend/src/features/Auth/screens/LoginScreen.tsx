import { useRouter } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native";
import LoginTemplate from "~features/Auth/templates/LoginTemplate";

export default function LoginScreen() {
  const router = useRouter();
  const [id, setId] = React.useState("");
  const [pw, setPw] = React.useState("");

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
        headerImageSource={require("@/assets/images/character/character-01.png")}
        showSocialLogin
        onPressKakao={() => {
          /* 카카오 로그인 로직 */
        }}
      />
    </SafeAreaView>
  );
}
