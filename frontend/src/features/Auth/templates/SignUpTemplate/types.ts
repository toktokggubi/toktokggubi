import type { ImageSourcePropType } from "react-native";

export interface SignUpTemplateProps {
  id: string;
  password: string;
  confirmPassword: string;

  onChangeId: (v: string) => void;
  onChangePassword: (v: string) => void;
  onChangeConfirmPassword: (v: string) => void;
  onNavigatePersonalInfo: () => void;
  onSubmit: () => void;

  // 에러
  errorMessage?: string; // 화면 상단에 한 줄로 보여줄 때
  idError?: string;
  passwordError?: string;
  confirmPasswordError?: string;
  // UX
  submitting?: boolean;
  disabled?: boolean;

  // 비번 토글
  passwordToggle?: boolean;
  confirmPasswordToggle?: boolean;
  onTogglePassword?: () => void;
  onToggleConfirmPassword?: () => void;

  // 헤더 이미지
  headerImageSource?: ImageSourcePropType;
}
