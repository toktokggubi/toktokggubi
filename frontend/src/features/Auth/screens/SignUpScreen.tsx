// src/features/Auth/screens/SignUpScreen.tsx
import { useRouter } from "expo-router";
import React from "react";
import { Alert, SafeAreaView } from "react-native";
import SignUpTemplate from "~features/Auth/templates/SignUpTemplate";

export default function SignUpScreen() {
  const router = useRouter();
  const [id, setId] = React.useState("");
  const [pw, setPw] = React.useState("");
  const [cpw, setCpw] = React.useState("");

  const [idErr, setIdErr] = React.useState<string | undefined>();
  const [pwErr, setPwErr] = React.useState<string | undefined>();
  const [cpwErr, setCpwErr] = React.useState<string | undefined>();
  const [generalErr, setGeneralErr] = React.useState<string | undefined>();

  const validate = () => {
    setIdErr(undefined);
    setPwErr(undefined);
    setCpwErr(undefined);
    setGeneralErr(undefined);
    let ok = true;
    if (!id.trim()) {
      setIdErr("아이디를 입력해주세요.");
      ok = false;
    }
    if (pw.length < 8) {
      setPwErr("비밀번호는 8자 이상 입력해주세요.");
      ok = false;
    }
    if (pw !== cpw) {
      setCpwErr("비밀번호가 일치하지 않아요.");
      ok = false;
    }
    return ok;
  };

  const onSubmit = () => {
    if (!validate()) return;
    Alert.alert("회원가입", "유효성 검사 통과! (API 연동 예정)");
    router.replace("/auth/login");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <SignUpTemplate
        id={id}
        password={pw}
        confirmPassword={cpw}
        onChangeId={setId}
        onChangePassword={setPw}
        onChangeConfirmPassword={setCpw}
        onSubmit={onSubmit}
        onNavigateLogin={() => router.replace("/auth/login")}
        errorMessage={generalErr}
        submitting={false}
        disabled={!id || !pw || !cpw}
      />
    </SafeAreaView>
  );
}
