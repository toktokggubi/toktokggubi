import { ViewStyle } from "react-native";

export interface BudgetWizardFooterProps {
  stepIndex: number;
  stepTotal: number;
  onPressPrev?: () => void;
  onPressNext: () => void;
  nextDisabled?: boolean;
  nextTone?: "filled" | "link";
  prevTone?: "filled" | "link";
  nextLabel?: string;

  /** 기본 하단 여백(px). 템플릿의 FOOTER_BOTTOM을 전달해 맞춰 쓸 수 있음 */
  baseBottom?: number;

  /** 외부 컨테이너 스타일 덮어쓰기 옵션 */
  style?: ViewStyle;
}
