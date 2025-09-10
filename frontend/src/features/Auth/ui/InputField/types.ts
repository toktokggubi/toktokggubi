import type { TextInput, TextInputProps } from "react-native";

export type InputFieldVariant = "default";

export interface InputFieldProps extends Omit<TextInputProps, "style"> {
  bottomLabel?: string; // 하단 라벨
  topLabel?: string; // 상단 라벨
  passwordToggle?: boolean; // 비밀번호 눈 아이콘
  variant?: InputFieldVariant; // 스타일
}

export type InputFieldRef = TextInput; // TextInput 컴포넌트의 ref 타입
