import type { ImageSourcePropType } from "react-native";

export interface WelcomeTemplateProps {
  centerImageSource?: ImageSourcePropType;

  // 함수
  onStart: () => void;
}
