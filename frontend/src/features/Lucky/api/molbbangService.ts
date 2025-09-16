// src/features/Lucky/api/molbbangService.ts
import { z } from "zod";

// ===== Types =====
export interface MolbbangMember {
  userId: string;
  nickname: string;
  ready: boolean;
  online?: boolean;
  score: number; // 최근 라운드 점수(데모용 필드)
  total?: number; // 누적 점수(랭킹 계산용)
}

export interface MolbbangRoom {
  code: string;
  amount: number;
  status: "lobby" | "playing" | "finished";
  round: number;
  totalRounds: number;
  members: MolbbangMember[];
  // ⬇️ 최종 결과 저장(마지막 라운드 종료 시 세팅)
  finalRanking?: string[]; // userId 목록(내림차순: 1등이 0번)
  jackpotUserId?: string; // 몰빵 당첨자(규칙: 꼴등)
}

// ===== Utils =====
function randomCode(len: number = 6): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++)
    out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}
function uid(): string {
  return `u_${Math.random().toString(36).slice(2, 10)}`;
}
function sortByTotalDesc(members: MolbbangMember[]): MolbbangMember[] {
  return [...members].sort((a, b) => (b.total ?? 0) - (a.total ?? 0));
}

// ===== In-memory DB =====
const rooms = new Map<string, MolbbangRoom>();

// 봇 제어
const BOT_NAMES = new Set(["빵순이", "깡총이"]);
const isBot = (m: MolbbangMember): boolean => BOT_NAMES.has(m.nickname);

// 봇 준비 타이머(중복 방지)
const botReadyTimers = new Map<string, ReturnType<typeof setTimeout>[]>();
function clearBotTimers(code: string): void {
  const arr = botReadyTimers.get(code);
  if (arr) {
    arr.forEach((t) => clearTimeout(t));
    botReadyTimers.delete(code);
  }
}
function scheduleBotsAutoReady(code: string): void {
  const room = rooms.get(code);
  if (!room || room.status !== "lobby") return;
  if (botReadyTimers.has(code)) return; // 중복 스케줄 방지

  const timers: ReturnType<typeof setTimeout>[] = [];
  room.members.forEach((m) => {
    if (!isBot(m) || m.ready) return;
    const delay = 800 + Math.floor(Math.random() * 1200); // 0.8~2.0s
    const t = setTimeout(() => {
      const r = rooms.get(code);
      if (!r || r.status !== "lobby") return;
      const target = r.members.find((x) => x.userId === m.userId);
      if (target) target.ready = true;
    }, delay);
    timers.push(t);
  });
  if (timers.length > 0) botReadyTimers.set(code, timers);
}

// 방 초기화(호스트+봇2)
function seedRoom(
  code: string,
  amount: number,
  hostNick: string
): MolbbangRoom {
  const host: MolbbangMember = {
    userId: uid(),
    nickname: hostNick || "호스트",
    ready: false,
    online: true,
    score: 0,
  };
  const bot1: MolbbangMember = {
    userId: uid(),
    nickname: "빵순이",
    ready: false,
    online: true,
    score: 0,
  };
  const bot2: MolbbangMember = {
    userId: uid(),
    nickname: "깡총이",
    ready: false,
    online: true,
    score: 0,
  };
  return {
    code,
    amount,
    status: "lobby",
    round: 1,
    totalRounds: 3,
    members: [host, bot1, bot2],
  };
}

// 상태 전이
function toLobby(r: MolbbangRoom): void {
  r.status = "lobby";
  r.members.forEach((m) => (m.ready = false));
  clearBotTimers(r.code);
  scheduleBotsAutoReady(r.code);
}
function toPlaying(r: MolbbangRoom): void {
  r.status = "playing";
  clearBotTimers(r.code);
}

// ===== Schemas =====
const SetReadyReq = z.object({
  userId: z.string().optional(),
  nickname: z.string().optional(),
  ready: z.boolean(),
});
type SetReadyReq = z.infer<typeof SetReadyReq>;

// ===== API =====
async function createRoom(dto: {
  amount: number;
  nickname: string;
}): Promise<{ code: string }> {
  const code = randomCode();
  const room = seedRoom(code, dto.amount, dto.nickname);
  rooms.set(code, room);
  scheduleBotsAutoReady(code);
  return { code };
}

async function joinRoom(dto: {
  code: string;
  nickname: string;
}): Promise<{ ok: true }> {
  let r = rooms.get(dto.code);
  if (!r) {
    r = seedRoom(dto.code, 1000, "호스트");
    rooms.set(dto.code, r);
  }
  const exist = r.members.find((m) => m.nickname === dto.nickname);
  if (exist) exist.online = true;
  else
    r.members.push({
      userId: uid(),
      nickname: dto.nickname,
      ready: false,
      online: true,
      score: 0,
    });

  scheduleBotsAutoReady(dto.code);
  return { ok: true };
}

async function fetchRoom(code: string): Promise<MolbbangRoom> {
  let r = rooms.get(code);
  if (!r) {
    r = seedRoom(code, 1000, "호스트");
    rooms.set(code, r);
    scheduleBotsAutoReady(code);
  }
  return r;
}

async function setReady(code: string, payload: SetReadyReq): Promise<void> {
  SetReadyReq.parse(payload);
  const r = rooms.get(code);
  if (!r) return;
  const { userId, nickname, ready } = payload;
  const target = r.members.find((m) =>
    userId ? m.userId === userId : m.nickname === nickname
  );
  if (target) target.ready = ready;
}

async function startRound(
  code: string
): Promise<{
  ok: boolean;
  reason?: "not_ready";
  round?: number;
  totalRounds?: number;
}> {
  const r = rooms.get(code);
  if (!r) return { ok: false };
  const canStart = r.members.length >= 2 && r.members.every((m) => m.ready);
  if (!canStart) return { ok: false, reason: "not_ready" };
  toPlaying(r);
  return { ok: true, round: r.round, totalRounds: r.totalRounds };
}

async function finishRound(
  code: string,
  payload?: { totals?: Record<string, number> }
): Promise<{ ok: boolean; status?: "lobby" | "finished"; round?: number }> {
  const r = rooms.get(code);
  if (!r) return { ok: false };

  // 1) 전달받은 점수 누적
  if (payload?.totals) {
    Object.entries(payload.totals).forEach(([userId, add]) => {
      const m = r.members.find((x) => x.userId === userId);
      if (m) {
        m.total = (m.total ?? 0) + (add ?? 0);
        m.score = add ?? 0;
      }
    });
  }

  // 2) 데모 편의: 제출 안 한 멤버(봇 포함)에게 랜덤 점수 누적
  r.members.forEach((m) => {
    const submitted = payload?.totals
      ? Object.prototype.hasOwnProperty.call(payload.totals, m.userId)
      : false;
    if (!submitted) {
      const add = 10 + Math.floor(Math.random() * 50); // 10~59
      m.total = (m.total ?? 0) + add;
      m.score = add;
    }
  });

  // 3) 다음 라운드 or 종료
  if (r.round < r.totalRounds) {
    r.round += 1;
    toLobby(r); // 다음 라운드 준비
    return { ok: true, status: "lobby", round: r.round };
  }

  // 4) 최종 종료: 최종 랭킹/몰빵 당첨자 계산 저장
  r.status = "finished";
  clearBotTimers(r.code);

  const ranking = sortByTotalDesc(r.members); // 내림차순: 0번이 1등, 마지막이 꼴등
  r.finalRanking = ranking.map((m) => m.userId);
  const last = ranking[ranking.length - 1];
  r.jackpotUserId = last?.userId; // 규칙: 꼴등이 몰빵 당첨

  return { ok: true, status: "finished", round: r.round };
}

// (선택) 라운드별 점수만 보내는 데모용 엔드포인트
async function submitScore(
  code: string,
  score: number
): Promise<{ ok: boolean }> {
  const r = rooms.get(code);
  if (!r) return { ok: false };
  // 데모: 첫 멤버에만 반영(실서비스에서는 본인 userId로 반영)
  const someone = r.members[0];
  if (someone) {
    someone.score = score;
    someone.total = (someone.total ?? 0) + score;
  }
  return { ok: true };
}

// 편의: 최종 결과 조회(클라에서 /result 화면에 사용)
async function getResults(code: string): Promise<{
  ok: boolean;
  ranking: { userId: string; nickname: string; total: number }[];
  jackpotUserId?: string;
  amount?: number;
}> {
  const r = rooms.get(code);
  if (!r) return { ok: false, ranking: [] };
  const ranking = sortByTotalDesc(r.members).map((m) => ({
    userId: m.userId,
    nickname: m.nickname,
    total: m.total ?? 0,
  }));
  return {
    ok: true,
    ranking,
    jackpotUserId: r.jackpotUserId,
    amount: r.amount,
  };
}

export const molbbangApi = {
  createRoom,
  joinRoom,
  fetchRoom,
  setReady,
  startRound,
  finishRound,
  submitScore, // 데모용
  getResults, // 결과 화면용
};
