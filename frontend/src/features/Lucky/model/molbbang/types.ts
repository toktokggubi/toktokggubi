// ✅ 외부 공개 Props/DTO는 interface 사용
export interface MolbbangRoom {
  code: string;
  amount: number; // 몰빵 금액
  hostId: string;
  members: MolbbangMember[];
  status: "lobby" | "countdown" | "playing" | "finished";
  round: number;
}

export interface MolbbangMember {
  userId: string;
  nickname: string;
  score: number; // 이번 라운드 누적 흔들기 값
  total?: number; // 여러 라운드 합 (옵션)
}

export interface CreateRoomDto {
  amount: number;
  nickname: string;
}

export interface JoinRoomDto {
  code: string;
  nickname: string;
}

export interface ShakeSample {
  t: number; // timestamp
  magnitude: number; // 가속도 벡터 크기
}
