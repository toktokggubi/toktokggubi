import type { ImageSourcePropType } from "react-native";

export interface MolbbangHomeTemplateProps {
  onPressCreate: () => void;
  onPressJoin: () => void;
  bgImg: ImageSourcePropType;
  danceVideo: number | { uri: string }; // expo-av 호환
}
