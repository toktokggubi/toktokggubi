// src/features/Lucky/templates/Molbbang/LobbyTemplate/types.ts
import type { MolbbangMember } from "@/features/Lucky/api/molbbangService";

export interface LobbyTemplateProps {
  code: string;
  amount: number;
  round: number;
  totalRounds: number;
  members: MolbbangMember[];
  presentCount: number;
  meNickname: string;
  myReady: boolean;
  allReady: boolean;
  canStart: boolean;
  onToggleReady: () => void;
  onStart: () => void;
  onCopyCode?: () => void; // ✅ 시안의 '복사' 버튼 대응(템플릿=조립, 실제 로직은 screen/model)
  showStartButton?: boolean;
}
