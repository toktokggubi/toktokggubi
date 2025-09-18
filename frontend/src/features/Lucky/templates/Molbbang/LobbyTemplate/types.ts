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
}
