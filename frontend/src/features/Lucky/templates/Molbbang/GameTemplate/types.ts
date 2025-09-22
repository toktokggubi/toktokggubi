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

  // 🔹 라운드 종료 모달
  rankModalVisible: boolean;
  rankModalData: { userId: string; nickname: string; total: number }[];
  isFinalRound: boolean;
  onNextRound: () => void;
  onViewFinal: () => void;

  remainingSeconds: number;
}
