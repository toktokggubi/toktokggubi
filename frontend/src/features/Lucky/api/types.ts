// ===== Request Types =====
export interface CreateRoomRequest {
  amount: number;
  nickname: string;
  totalRounds?: number;
}

export interface JoinRoomRequest {
  code: string;
  nickname: string;
}

export interface ReadyRequest {
  ready: boolean;
}

export interface SubmitScoreRequest {
  score: number;
}

// ===== Response Types =====
export interface CreateRoomResponse {
  code: string;
}

export interface OkResponse {
  ok: boolean;
}

export interface StartRoundResponse {
  ok: boolean;
  round: number;
  totalRounds: number;
}

export interface GameEndResponse {
  ok: boolean;
  status: string;
}

export interface MolbbangMember {
  memberId: number;
  userId: number;
  nickname: string;
  ready: boolean;
  host: boolean;
  active: boolean;
}

export interface RoomView {
  code: string;
  amount: number;
  status: "LOBBY" | "IN_PROGRESS" | "FINISHED" | "CANCELLED";
  round: number | null; // 백엔드의 currentRoundNo와 매핑
  totalRounds: number;
  members: Array<{
    memberId: number;
    userId: number;
    nickname: string;
    ready: boolean;
    host: boolean;
    active: boolean;
  }>;
}

export interface RankingRow {
  userId: number;
  nickname: string;
  score: number; // totalScore → score로 변경
  rank: number;
}

export interface ResultsResponse {
  ok: boolean;
  ranking: RankingRow[];
  jackpotUserId?: number | null; // 백엔드의 Long (nullable)에 맞춤
  amount: number;
}
