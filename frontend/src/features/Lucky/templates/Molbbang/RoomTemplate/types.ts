import type { ImageSourcePropType } from "react-native";
import type { MolbbangMember } from "@/features/Lucky/model/molbbang/types";

export interface RankingItem {
  userId: string;
  nickname: string;
  final: number; // 최종 점수 (total ?? score)
  isMe: boolean;
}

export interface RoomTemplateProps {
  code: string;
  amount: number;
  status: "lobby" | "countdown" | "playing" | "finished";
  round: number;
  magnitude: number;
  myScore: number;
  onStart: () => void;
  onFinishRound: () => void;
  onShareLink: () => void;
  onShowQr: () => void;
  idleImage: ImageSourcePropType;
  shakeImage: ImageSourcePropType;

  // 참가자/인원
  members: MolbbangMember[];
  presentCount: number;
  meNickname: string;

  // 종료 결과
  ranking: RankingItem[];

  // ✅ 준비 토글
  myReady: boolean;
  canStart: boolean; // 모든 인원이 준비 + 최소 2명
  allReady: boolean; // 모든 인원 준비 여부
  onToggleReady: () => void;
}
