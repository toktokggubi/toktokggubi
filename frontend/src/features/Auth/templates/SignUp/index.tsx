import Button from "@/features/Auth/ui/Button";
import InputField from "@/features/Auth/ui/InputField";
import { StyleSheet, View } from "react-native";
import { LoginTemplateProps } from "./types";

export default function LoginTemplate({
  id,
  password,
  onChangeId,
  onChangePassword,
  onSubmit,
  errorMessage,
}: LoginTemplateProps) {
  return (
    <View style={s.wrap}>
      {/* 아이디 입력 */}
      <InputField placeholder="아이디" value={id} onChangeText={onChangeId} />

      {/* 비밀번호 입력 */}
      <InputField
        placeholder="비밀번호"
        value={password}
        onChangeText={onChangePassword}
        secureTextEntry
        passwordToggle
        bottomLabel={errorMessage}
      />

      {/* 로그인 버튼 */}
      <Button value="로그인" onPress={onSubmit} />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    gap: 20,
  },
});
