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
  liveRanking: {
    userId: string;
    nickname: string;
    total: number;
    isMe: boolean;
  }[];
}
