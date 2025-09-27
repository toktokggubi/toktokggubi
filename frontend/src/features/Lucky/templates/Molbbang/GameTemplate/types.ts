import type { ImageSourcePropType } from "react-native";

export interface GameTemplateProps {
  code: string;
  amount: number;
  round: number;
  magnitude: number;
  myScore: number;
  idleImage: ImageSourcePropType;
  shakeImage: ImageSourcePropType;
  onFinishRound: () => void;
  remainingSeconds: number;
}
