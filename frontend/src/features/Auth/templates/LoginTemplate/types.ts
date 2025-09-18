import type { ReactNode } from "react";
import type { ImageSourcePropType } from "react-native";

export interface LoginTemplateProps {
  id: string;
  password: string;
  onChangeId: (v: string) => void;
  onChangePassword: (v: string) => void;
  onSubmit: () => void;
  errorMessage?: string;
  onNavigateSignUp?: () => void;

  headerImageSource?: ImageSourcePropType;
  renderHeader?: ReactNode;
  showSocialLogin?: boolean;
  onPressKakao?: () => void;
  submitting?: boolean;
  disabled?: boolean;
}
