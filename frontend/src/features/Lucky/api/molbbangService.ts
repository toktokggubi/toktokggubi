// src/features/Lucky/api/molbbangService.ts
import { z } from "zod";
import * as molbbangFetchers from "./fetchers";
import type { RoomView } from "./types";
import { Client, IMessage } from "@stomp/stompjs";
import * as SecureStore from "expo-secure-store";

// ===== 기존 타입 호환성을 위한 변환 함수들 =====
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
  status: "lobby" | "playing" | "finished" | "cancelled";
  round: number;
  totalRounds: number;
  members: MolbbangMember[];
  // ⬇️ 최종 결과 저장(마지막 라운드 종료 시 세팅)
  finalRanking?: string[]; // userId 목록(내림차순: 1등이 0번)
  jackpotUserId?: string; // 몰빵 당첨자(규칙: 꼴등)
}

// ===== Utils =====

// 토큰 갱신은 http.ts의 자동 갱신 로직에 의존

// ===== Schemas =====
const SetReadyReq = z.object({
  ready: z.boolean(),
});
type SetReadyReq = z.infer<typeof SetReadyReq>;

// ===== 타입 변환 함수들 =====
export function convertRoomViewToMolbbangRoom(
  roomView: RoomView
): MolbbangRoom {
  const convertedMembers = roomView.members.map((member) => ({
    userId: member.userId.toString(),
    nickname: member.nickname,
    ready: member.ready,
    online: member.active,
    score: 0, // 백엔드에서는 라운드별 점수를 별도로 관리
    total: 0, // 백엔드에서는 총점을 별도로 관리
  }));

  // 멤버 목록 변환 완료

  // 상태 변환
  let status: "lobby" | "playing" | "finished" | "cancelled";
  switch (roomView.status) {
    case "LOBBY":
      status = "lobby";
      break;
    case "IN_PROGRESS":
      status = "playing";
      break;
    case "FINISHED":
      status = "finished";
      break;
    case "CANCELLED":
      status = "cancelled";
      break;
    default:
      status = "lobby";
  }

  return {
    code: roomView.code,
    amount: roomView.amount,
    status,
    round: roomView.round || 1, // null인 경우 1로 기본값 설정
    totalRounds: roomView.totalRounds,
    members: convertedMembers,
  };
}

// ===== API =====

async function createRoom(dto: {
  amount: number;
  nickname: string;
}): Promise<{ code: string }> {
  const response = await molbbangFetchers.createRoom({
    amount: dto.amount,
    nickname: dto.nickname,
    totalRounds: 3, // 기본값
  });

  return { code: response.code };
}

async function joinRoom(dto: {
  code: string;
  nickname: string;
}): Promise<{ ok: true }> {
  await molbbangFetchers.joinRoom({
    code: dto.code,
    nickname: dto.nickname,
  });
  return { ok: true };
}

async function fetchRoom(): Promise<MolbbangRoom> {
  const roomView = await molbbangFetchers.getMyRoom();
  return convertRoomViewToMolbbangRoom(roomView);
}

async function setReady(payload: SetReadyReq): Promise<void> {
  SetReadyReq.parse(payload);
  await molbbangFetchers.setReady({
    ready: payload.ready,
  });
}

async function startRound(): Promise<{
  ok: boolean;
  reason?: "not_ready";
  round?: number;
  totalRounds?: number;
}> {
  try {
    const response = await molbbangFetchers.startGame();
    return {
      ok: response.ok,
      round: response.round,
      totalRounds: response.totalRounds,
    };
  } catch (error: any) {
    if (error.response?.status === 400) {
      return { ok: false, reason: "not_ready" };
    }
    throw error;
  }
}

async function finishRound(payload?: {
  totals?: Record<string, number>;
}): Promise<{ ok: boolean; status?: string; round?: number }> {
  const response = await molbbangFetchers.endRound();
  return {
    ok: response.ok,
    status: response.status,
    round: response.round,
  };
}

async function submitScore(score: number): Promise<{ ok: boolean }> {
  try {
    const response = await molbbangFetchers.submitScore({ score });
    return { ok: response.ok };
  } catch (error: any) {
    // 백엔드 에러 코드에 따른 처리
    if (error.response?.status === 400) {
      const errorMessage = error.response?.data?.message || error.message;
      if (errorMessage.includes("already_submitted")) {
        console.log("🔍 [점수 제출] 이미 제출된 점수");
        return { ok: true }; // 이미 제출된 경우 성공으로 처리
      } else if (errorMessage.includes("not_in_round")) {
        console.log("🔍 [점수 제출] 라운드가 활성 상태가 아님");
        throw new Error("라운드가 종료되었습니다");
      } else if (errorMessage.includes("no_active_round")) {
        console.log("🔍 [점수 제출] 활성 라운드가 없음");
        throw new Error("게임이 시작되지 않았습니다");
      }
    }
    throw error;
  }
}

async function getResults(): Promise<{
  ok: boolean;
  ranking: { userId: string; nickname: string; total: number }[];
  jackpotUserId?: string;
  amount?: number;
}> {
  console.log("🔍 [getResults] API 호출 시작");

  try {
    const response = await molbbangFetchers.getResults();
    console.log("🔍 [getResults] API 호출 성공:", {
      ok: response.ok,
      rankingCount: response.ranking.length,
      jackpotUserId: response.jackpotUserId,
      amount: response.amount,
      firstRanking: response.ranking[0],
    });

    return {
      ok: response.ok,
      ranking: response.ranking.map((row) => ({
        userId: row.userId.toString(),
        nickname: row.nickname,
        total: row.totalScore,
      })),
      jackpotUserId: response.jackpotUserId?.toString(),
      amount: response.amount,
    };
  } catch (error: any) {
    console.error("🔍 [getResults] API 호출 실패 - 상세 정보:", {
      error: error,
      message: error.message,
      response: error.response,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      responseHeaders: error.response?.headers,
      config: error.config,
      url: error.config?.url,
      method: error.config?.method,
      requestHeaders: error.config?.headers,
    });
    throw error;
  }
}

// ===== 웹소켓 연결 관리 =====
class MolbbangWebSocketManager {
  private client: Client | null = null;
  private roomCode: string | null = null;
  private onRoomUpdateCallback: ((room: MolbbangRoom) => void) | null = null;
  private debug: boolean = false;

  async connect(
    roomCode: string,
    onRoomUpdate?: (room: MolbbangRoom) => void,
    debug: boolean = false
  ) {
    if (this.client?.connected) {
      if (__DEV__) {
        console.log("WebSocket already connected");
      }
      return;
    }

    this.roomCode = roomCode;
    this.onRoomUpdateCallback = onRoomUpdate || null;
    this.debug = debug;

    const accessToken = await SecureStore.getItemAsync("access_token");
    if (!accessToken || accessToken.trim() === "") {
      throw new Error("No valid access token found");
    }

    // 토큰 만료 시간 확인
    try {
      const tokenPayload = JSON.parse(atob(accessToken.split(".")[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      if (__DEV__) {
        console.log("🔍 토큰 정보:", {
          exp: tokenPayload.exp,
          current: currentTime,
          remaining: tokenPayload.exp - currentTime,
          userId: tokenPayload.sub,
          type: tokenPayload.t,
        });
      }

      if (tokenPayload.exp && tokenPayload.exp < currentTime) {
        if (__DEV__) {
          console.warn("🔍 토큰이 만료됨:", {
            exp: tokenPayload.exp,
            current: currentTime,
            expired: currentTime - tokenPayload.exp,
          });
        }
        throw new Error("Access token expired");
      }
    } catch (error) {
      if (__DEV__) {
        console.warn("🔍 토큰 파싱 실패:", error);
      }
    }

    if (__DEV__) {
      console.log("🔍 WebSocket 연결 시도 - 토큰 길이:", accessToken.length);
    }

    const wsUrl = "wss://j13b207.p.ssafy.io/api/ws";
    // 쿼리 파라미터와 헤더 둘 다로 토큰 전달 (백엔드에서 둘 다 지원)
    const wsUrlWithToken = `${wsUrl}?token=${encodeURIComponent(accessToken)}`;

    if (__DEV__) {
      console.log(
        "🔍 WebSocket URL:",
        wsUrlWithToken.substring(0, 100) + "..."
      );
    }

    this.client = new Client({
      brokerURL: wsUrlWithToken,
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
        // 추가 헤더들
        "User-Agent": "ReactNative",
        Accept: "application/json",
      },
      reconnectDelay: 2000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (str) => debug && console.log("[STOMP]", str), // 몰빵 웹소켓 로그만 유지
      onConnect: () => {
        if (__DEV__) {
          console.log("WebSocket connected");
        }
        this.subscribeToRoom();
      },
      onStompError: (frame) => {
        if (__DEV__) {
          console.warn("🔍 STOMP error:", {
            headers: frame.headers,
            body: frame.body,
            command: frame.command,
          });
        }
      },
      onWebSocketError: (ev) => {
        if (__DEV__) {
          console.warn("🔍 WebSocket error:", {
            type: ev.type,
            target: ev.target?.url,
            readyState: ev.target?.readyState,
          });
        }
      },
      onDisconnect: () => {
        if (__DEV__) {
          console.log("WebSocket disconnected");
        }
      },
    });

    this.client.activate();
  }

  private subscribeToRoom() {
    if (!this.client?.connected || !this.roomCode) return;

    const destination = `/topic/molbbang.${this.roomCode}`;
    this.client.subscribe(destination, (message: IMessage) => {
      try {
        const roomView = JSON.parse(message.body) as RoomView;
        const convertedRoom = convertRoomViewToMolbbangRoom(roomView);
        this.onRoomUpdateCallback?.(convertedRoom);
        if (this.debug) {
          console.log("Room update received:", convertedRoom);
        }
      } catch (error) {
        console.error("Error parsing room update:", error);
      }
    });

    if (this.debug) {
      console.log("Subscribed to:", destination);
    }
  }

  disconnect() {
    if (this.client?.active) {
      this.client.deactivate();
    }
    this.client = null;
    this.roomCode = null;
    this.onRoomUpdateCallback = null;
  }

  // 웹소켓을 통한 메시지 전송
  sendReady(ready: boolean) {
    if (!this.client?.connected) {
      throw new Error("WebSocket not connected");
    }
    this.client.publish({
      destination: "/app/molbbang/me/ready",
      body: JSON.stringify({ ready }),
    });
    if (this.debug) {
      console.log("Sent ready:", ready);
    }
  }

  sendStart() {
    if (!this.client?.connected) {
      throw new Error("WebSocket not connected");
    }
    this.client.publish({
      destination: "/app/molbbang/me/start",
      body: "{}",
    });
    if (this.debug) {
      console.log("Sent start game");
    }
  }

  sendScore(score: number) {
    if (!this.client?.connected) {
      throw new Error("WebSocket not connected");
    }

    // 점수 유효성 검사
    if (typeof score !== "number" || score < 0) {
      throw new Error("유효하지 않은 점수입니다");
    }

    this.client.publish({
      destination: "/app/molbbang/me/score",
      body: JSON.stringify({ score }),
    });
    if (this.debug) {
      console.log("Sent score:", score);
    }
  }

  sendEnd() {
    if (!this.client?.connected) {
      throw new Error("WebSocket not connected");
    }
    this.client.publish({
      destination: "/app/molbbang/me/end",
      body: "{}",
    });
    if (this.debug) {
      console.log("Sent end game");
    }
  }

  get connected(): boolean {
    return this.client?.connected ?? false;
  }
}

// 전역 웹소켓 매니저 인스턴스
const wsManager = new MolbbangWebSocketManager();

// ===== 웹소켓 API =====
async function connectWebSocket(
  roomCode: string,
  onRoomUpdate?: (room: MolbbangRoom) => void,
  debug: boolean = false
): Promise<void> {
  await wsManager.connect(roomCode, onRoomUpdate, debug);
}

function disconnectWebSocket(): void {
  wsManager.disconnect();
}

function sendWebSocketReady(ready: boolean): void {
  wsManager.sendReady(ready);
}

function sendWebSocketStart(): void {
  wsManager.sendStart();
}

function sendWebSocketScore(score: number): void {
  wsManager.sendScore(score);
}

function sendWebSocketEnd(): void {
  wsManager.sendEnd();
}

function isWebSocketConnected(): boolean {
  return wsManager.connected;
}

async function leaveRoom(): Promise<{ ok: true }> {
  await molbbangFetchers.leaveRoom();
  return { ok: true };
}

export const molbbangApi = {
  createRoom,
  joinRoom,
  leaveRoom,
  fetchRoom,
  setReady,
  startRound,
  finishRound,
  submitScore,
  getResults,
  // 웹소켓 관련 API
  connectWebSocket,
  disconnectWebSocket,
  sendWebSocketReady,
  sendWebSocketStart,
  sendWebSocketScore,
  sendWebSocketEnd,
  isWebSocketConnected,
};
