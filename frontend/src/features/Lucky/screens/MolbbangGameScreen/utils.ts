// src/features/Lucky/screens/MolbbangGameScreen/utils.ts
import type { MolbbangRoom } from "@/features/Lucky/api/molbbangService";

// 전역 변수 타입 선언
declare global {
  interface Window {
    __gameParamsLogged?: boolean;
    __lobbyParamsLogged?: boolean;
    __resultParamsLogged?: boolean;
  }
}

// 타입 가드
export function isRoom(v: unknown): v is MolbbangRoom {
  return (
    typeof v === "object" &&
    v !== null &&
    Array.isArray((v as { members?: unknown }).members) &&
    typeof (v as { status?: unknown }).status === "string"
  );
}

// 파라미터 파싱 유틸리티
export function parseGameParams(params: {
  code?: string | string[];
  nick?: string | string[];
  amount?: string | string[];
  host?: string | string[];
}) {
  const code =
    typeof params.code === "string"
      ? params.code
      : Array.isArray(params.code)
      ? params.code[0]
      : "";

  const nickname =
    typeof params.nick === "string"
      ? params.nick
      : Array.isArray(params.nick)
      ? params.nick[0]
      : "";

  const amount =
    typeof params.amount === "string"
      ? parseInt(params.amount)
      : Array.isArray(params.amount)
      ? parseInt(params.amount[0])
      : 0;

  // URL 파라미터 디버깅 (한 번만 출력)
  if (typeof window !== "undefined" && !window.__gameParamsLogged) {
    console.log("🔍 [게임 화면] URL 파라미터 받기:", {
      rawParams: params,
      parsedCode: code,
      parsedNickname: nickname,
      parsedAmount: amount,
      hostFlag: params.host,
    });
    window.__gameParamsLogged = true;
  }

  const hostFlagFromParams =
    typeof params.host === "string"
      ? params.host === "1" || params.host === "true"
      : Array.isArray(params.host)
      ? params.host[0] === "1" || params.host[0] === "true"
      : false;

  return {
    code,
    nickname,
    amount,
    hostFlagFromParams,
  };
}

// 게임 상수
export const GAME_CONSTANTS = {
  ROUND_MS: 10000, // 10초
  INITIAL_SECONDS: 10,
  INITIAL_SCORE: 0,
  POLLING_INTERVAL: 3000,
} as const;
