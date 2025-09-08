export type ButtonVariant = "default";

export interface ButtonProps {
  value: string; // 버튼 텍스트
  onPress?: () => void; // 버튼 클릭 시 호출되는 함수
  variant?: ButtonVariant; // 스타일
}
