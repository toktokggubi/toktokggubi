export interface ResultTemplateProps {
  code: string;
  amount: number;
  ranking: { userId: string; nickname: string; total: number }[];
  myNickname: string;
  myRank: number | null;
  jackpotNickname?: string;
  onBackToLobby: () => void;
  onExit?: () => void;
  isLoser?: boolean; // 내가 꼴등이면 true
  onPay?: () => void;
}
