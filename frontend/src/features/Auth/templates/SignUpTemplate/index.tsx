import Button from "@/features/Auth/ui/Button";
import InputField from "@/features/Auth/ui/InputField";
import { font } from "@/shared/typography/font";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
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
  onTogglePassword,
  onToggleConfirmPassword,
  onNavigatePersonalInfo,
  headerImageSource,
  //
  errorMessage,
  idError,
  passwordError,
  confirmPasswordError,
}: SignUpTemplateProps) {
  return (
    <KeyboardAvoidingView 
      style={style.wrap}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={style.wrap}>
            <View>
              {headerImageSource && (
                <Image
                  source={headerImageSource}
                  resizeMode="contain"
                  style={{ width: 150, height: 100 }}
                />
              )}
            </View>
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
            <View style={style.container}>
              <View style={style.signUpSection}>
                {/* 아이디 입력 */}
                <InputField
                  placeholder="이메일"
                  value={id}
                  onChangeText={onChangeId}
                  bottomLabel="6~12자 영문, 숫자로 입력해주세요"
                  error={idError}
                />

                {/* 비밀번호 입력 */}
                <InputField
                  placeholder="비밀번호"
                  value={password}
                  onChangeText={onChangePassword}
                  secureTextEntry
                  passwordToggle={passwordToggle ?? true}
                  onTogglePassword={onTogglePassword}
                  error={passwordError}
                />

                {/* 비밀번호 확인 입력 */}
                <InputField
                  placeholder="비밀번호 확인"
                  value={confirmPassword}
                  onChangeText={onChangeConfirmPassword}
                  secureTextEntry
                  passwordToggle={confirmPasswordToggle ?? true}
                  onTogglePassword={onToggleConfirmPassword}
                  bottomLabel="비밀번호는 영문 대소문자, 숫자, 특수문자(.!@#$%)를 혼합하여 8~20자로 입력해주세요."
                  error={confirmPasswordError}
                />

                {/* 회원가입 버튼 */}
                <Button value="가입하기" onPress={onNavigatePersonalInfo} />
              </View>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const style = StyleSheet.create({
  introWrap: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "baseline",
    paddingHorizontal: 16,
  },
  introBold: {
    fontSize: 24,
    ...font.bold,
    lineHeight: 45,
    color: "#0E3159",
  },
  introNormal: {
    fontSize: 24,
    fontWeight: "200",
    color: "#0E3159",
  },
  wrap: {
    flex: 1,
    backgroundColor: "#F8FBFF",
    paddingTop: 70,
  },
  container: {
    paddingHorizontal: 16,
  },
  signUpSection: {
    marginBottom: 34,
    marginTop: 64,
  },
});
