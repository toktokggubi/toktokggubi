import Button from "@/features/Auth/ui/Button";
import InputField from "@/features/Auth/ui/InputField";
import { StyleSheet, Text, View } from "react-native";
import { SignUpTemplateProps } from "./types";

export default function SignUpTemplate({
  id,
  password,
  onChangeId,
  onChangePassword,
  onSubmit,
  passwordToggle,
  confirmPassword,
  onChangeConfirmPassword,
  confirmPasswordToggle,
  onNavigateLogin,
  //
  errorMessage,
}: SignUpTemplateProps) {
  return (
    <View style={style.wrap}>
      <View style={style.container}>
        <View style={style.introWrap}>
          <Text style={style.introNormal}>지금 </Text>
          <Text style={style.introBold}>회원가입</Text>
          <Text style={style.introNormal}>만 해도</Text>
        </View>
        <View style={style.introWrap}>
          <Text style={style.introNormal}>내 </Text>
          <Text style={style.introBold}>소비생활 코칭</Text>
          <Text style={style.introNormal}>을 받을 수 있어요!</Text>
        </View>
        <View style={{ marginTop: 70, marginBottom: 20 }}>
          "{/* 아이디 입력 */}
          <InputField
            placeholder="아이디"
            value={id}
            onChangeText={onChangeId}
            bottomLabel="6~12자 영문, 숫자로 입력해주세요"
          />
        </View>
        {/* 비밀번호 입력 */}
        <InputField
          placeholder="비밀번호"
          value={password}
          onChangeText={onChangePassword}
          secureTextEntry
          passwordToggle={passwordToggle ?? true}
        />

        <InputField
          placeholder="비밀번호 확인"
          value={confirmPassword}
          onChangeText={onChangeConfirmPassword}
          secureTextEntry
          passwordToggle={confirmPasswordToggle ?? true}
          bottomLabel="비밀번호는 영문 대소문자, 숫자, 특수문자(.!@#$%)를 혼합하여 8~20자로 입력해주세요."
        />

        {/* 회원가입 버튼 */}
        <View style={{ marginTop: 20 }}>
          <Button value="가입하기" onPress={onSubmit} />
        </View>
      </View>
    </View>
  );
}

const style = StyleSheet.create({
  introWrap: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  introBold: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0E3159",
  },
  introNormal: {
    fontSize: 24,
    fontWeight: "200",
    color: "#0E3159",
  },
  wrap: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  container: {
    paddingHorizontal: 16,
  },
});
