// app/auth/login.tsx
import LoginTemplate from "@/features/Auth/templates/LoginTemplate";
import { useState } from "react";
import { SafeAreaView } from "react-native";

export default function LoginScreen() {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LoginTemplate
        id={id}
        password={pw}
        onChangeId={setId}
        onChangePassword={setPw}
        onSubmit={() => console.log("로그인 시도:", id, pw)}
        errorMessage={undefined}
      />
    </SafeAreaView>
  );
}
