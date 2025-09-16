import { ImageSourcePropType } from "react-native";

export interface BudgetIntroTemplateProps {
  onNext: () => void;
  nextDisabled?: boolean;

  /** 화면에서 주입하는 이미지(템플릿은 import 금지) */
  mascotSource: ImageSourcePropType;
}
