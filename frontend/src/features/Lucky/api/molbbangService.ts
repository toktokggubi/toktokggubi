// ✅ api 레이어: fetcher + (나중에) Zod parse 권장
// 지금은 서버 미구현이라 로컬 mock + 임시 Promise 로 대체

function randomCode(len: number = 6): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++)
    out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export const molbbangApi = {
  async createRoom(dto: { amount: number; nickname: string }) {
    const code = randomCode();
    // TODO: 서버 생기면 POST /rooms
    return { code };
  },

  async joinRoom(dto: { code: string; nickname: string }) {
    // TODO: 서버 호출로 검증
    return { ok: true };
  },

  // 실시간은 나중에 WebSocket으로 교체. 지금은 폴링 흉내용.
  async fetchRoom(code: string) {
    // TODO: GET /rooms/:code
    return { status: "lobby" as const, round: 1 };
  },

  async submitScore(code: string, score: number) {
    // TODO: POST /rooms/:code/score
    return { ok: true };
  },
};
