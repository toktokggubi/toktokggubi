import Button from "@/features/Auth/ui/Button";
import InputField from "@/features/Auth/ui/InputField";
import { font } from "@/shared/typography/font";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { LoginTemplateProps } from "./types";

export default function LoginTemplate({
  id,
  password,
  onChangeId,
  onChangePassword,
  onSubmit,
  errorMessage,
  onNavigateSignUp,
  passwordToggle,
  onTogglePassword,
  showSocialLogin,
  onPressKakao,
  submitting,
  disabled,
  headerImageSource,
}: LoginTemplateProps) {
  return (
    <KeyboardAvoidingView 
      style={style.avoiding}
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
              <Text style={style.introBold}>똑똑꺼비</Text>
              <Text style={style.introNormal}>와 함께</Text>
            </View>
            <View style={style.introWrap}>
              <Text style={style.introBold}>똑똑한 소비생활</Text>
              <Text style={style.introNormal}> 함께해요!</Text>
            </View>
            <View style={style.container}>
              <View style={style.loginSection}>
                {/* 이메일 입력 */}
                <InputField
                  placeholder="이메일"
                  value={id}
                  onChangeText={onChangeId}
                />

                {/* 비밀번호 입력 */}
                <InputField
                  placeholder="비밀번호"
                  value={password}
                  onChangeText={onChangePassword}
                  secureTextEntry
                  onTogglePassword={onTogglePassword}
                  bottomLabel={errorMessage}
                />

                {/* 로그인 버튼 */}
                <Button 
                  value={submitting ? "로그인 중..." : "로그인"} 
                  onPress={onSubmit}
                  disabled={disabled}
                />

                {/* 하단 작은 링크 */}
                <View style={style.signUpLink}>
                  <Text style={style.guideText}>아직 회원이 아니신가요?</Text>
                  <Pressable onPress={onNavigateSignUp}>
                    <Text>회원가입하기</Text>
                  </Pressable>
                </View>
              </View>

              {/* 간편 로그인 */}
              {showSocialLogin && (
                <>
                  <View style={style.divider}>
                    <View style={style.line}></View>
                    <Text style={style.dividerText}>간편 로그인</Text>
                    <View style={style.line}></View>
                  </View>
                  <Button
                    value="카카오로 시작하기"
                    variant="kakaoButton"
                    onPress={onPressKakao}
                    disabled={disabled}
                    icon={
                      <Image
                        source={require("@/assets/icon/kakao.png")}
                        style={{ width: 20, height: 20, marginTop: 4 }}
                        resizeMode="contain"
                      />
                    }
                  />
                </>
              )}
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const style = StyleSheet.create({
  avoiding: {
    flex: 1,
  },
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
    paddingTop: 140,
  },
  container: {
    paddingHorizontal: 16,
  },
  loginSection: {
    marginBottom: 34,
    marginTop: 64,
  },
  // 회원가입 링크
  signUpLink: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  guideText: {
    color: "#D2D3D7",
  },
  smallText: {
    color: "#6E727F",
  },

  // 간편 로그인 선 나누기
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#E9EBF8",
    marginHorizontal: 3,
  },
  dividerText: {
    marginHorizontal: 8,
    color: "#6E727F",
    fontSize: 12,
  },
});
