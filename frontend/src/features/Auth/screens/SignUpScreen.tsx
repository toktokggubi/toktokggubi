import { useState } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import SignUpTemplate from "../templates/SignUpTemplate";
import { useSignup } from "../model/useAuthQueries";
import type { SignupFormData, SignupFormErrors } from "../types/signup.types";

export default function SignUpScreen() {
  const [formData, setFormData] = useState<SignupFormData>({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<SignupFormErrors>({});
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const signupMutation = useSignup();

  // 폼 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: SignupFormErrors = {};

    // 이메일 검증
    if (!formData.email) {
      newErrors.email = "이메일을 입력해주세요.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "올바른 이메일 형식을 입력해주세요.";
    }

    // 비밀번호 검증
    if (!formData.password) {
      newErrors.password = "비밀번호를 입력해주세요.";
    } else if (formData.password.length < 8 || formData.password.length > 20) {
      newErrors.password = "비밀번호는 8~20자로 입력해주세요.";
    } else if (!/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[.!@#$%])/.test(formData.password)) {
      newErrors.password = "영문, 숫자, 특수문자(.!@#$%)를 포함해주세요.";
    }

    // 비밀번호 확인 검증
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호 확인을 입력해주세요.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 회원가입 처리
  const handleSignup = async () => {
    if (!validateForm()) return;

    try {
      await signupMutation.mutateAsync({
        email: formData.email,
        password: formData.password,
      });
      
      // 회원가입 성공 시 개인정보 입력 화면으로 이동
      router.push("/auth/personalinfo");
    } catch (error: any) {
      console.error("회원가입 실패:", error);
      console.error("에러 상세:", {
        message: error.message,
        code: error.code,
        config: error.config,
        response: error.response,
      });
      
      let errorMessage = "회원가입 중 오류가 발생했습니다.";
      
      if (error.code === "NETWORK_ERROR" || error.message === "Network Error") {
        errorMessage = "네트워크 연결을 확인해주세요. 서버가 실행 중인지 확인해주세요.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert("회원가입 실패", errorMessage);
    }
  };

  // 개인정보 입력 화면으로 이동 (기존 로직 유지)
  const handleNavigatePersonalInfo = () => {
    if (!validateForm()) return;
    handleSignup();
  };

  // 비밀번호 토글 핸들러
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  return (
    <SignUpTemplate
      id={formData.email}
      password={formData.password}
      confirmPassword={formData.confirmPassword}
      onChangeId={(value) => setFormData(prev => ({ ...prev, email: value }))}
      onChangePassword={(value) => setFormData(prev => ({ ...prev, password: value }))}
      onChangeConfirmPassword={(value) => setFormData(prev => ({ ...prev, confirmPassword: value }))}
      onNavigatePersonalInfo={handleNavigatePersonalInfo}
      onSubmit={handleSignup}
      errorMessage={errors.general}
      idError={errors.email}
      passwordError={errors.password}
      confirmPasswordError={errors.confirmPassword}
      submitting={signupMutation.isPending}
      disabled={signupMutation.isPending}
      passwordToggle={passwordVisible}
      confirmPasswordToggle={confirmPasswordVisible}
      onTogglePassword={togglePasswordVisibility}
      onToggleConfirmPassword={toggleConfirmPasswordVisibility}
    />
  );
}