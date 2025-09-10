// src/features/User/api/cardService.ts
import {
  type UserCard,
  CARD_IMAGE_BY_ISSUER,
  DEFAULT_CARD_IMAGE,
} from "@/features/User/screens/MyPageScreen/types";

/** 초기 더미 */
export function getUserCards(): UserCard[] {
  const raw = [
    {
      userCardId: 101,
      cardName: "국민 청춘카드",
      cardIssuerCode: "KB",
      last4: "1234",
      isActive: true,
    },
    {
      userCardId: 202,
      cardName: "삼성 탭탭오",
      cardIssuerCode: "SS",
      last4: "5678",
      isActive: false,
    },
    {
      userCardId: 303,
      cardName: "신한 Deep",
      cardIssuerCode: "SH",
      last4: "9999",
      isActive: true,
    },
  ] as const;
  return raw.map((c) => ({
    ...c,
    image: CARD_IMAGE_BY_ISSUER[c.cardIssuerCode] ?? DEFAULT_CARD_IMAGE,
  }));
}

/** ---------- 동기화: 실제 API 붙을 때는 USE_REAL_API=true 로 스위치 ---------- */

const USE_REAL_API = false; // ← 나중에 true 로 바꾸거나, env에서 읽어도 됨

// 서버 응답 타입(필요 필드만)
interface SyncCardApi {
  userCardId: number;
  issuer: { code: string; name: string };
  cardName: string;
  last4: string;
  isActive: boolean;
}
interface SyncResponse {
  message: string;
  syncedAt: string;
  added: number;
  updated: number;
  deactivated: number;
  totalActive: number;
  cards: SyncCardApi[];
}

function mapApiToUserCard(api: SyncCardApi): UserCard {
  const code = api.issuer?.code ?? "UNKNOWN";
  return {
    userCardId: api.userCardId,
    cardName: api.cardName,
    cardIssuerCode: code,
    last4: api.last4,
    isActive: api.isActive,
    image: CARD_IMAGE_BY_ISSUER[code] ?? DEFAULT_CARD_IMAGE,
  };
}

/** 실제 호출 버전 */
async function syncReal(userId: string | number) {
  const res = await fetch(`/wallet/${userId}/cards/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`Sync failed: ${res.status}`);
  const data = (await res.json()) as SyncResponse;
  return {
    list: data.cards.map(mapApiToUserCard),
    meta: {
      message: data.message,
      syncedAt: data.syncedAt,
      added: data.added,
      updated: data.updated,
      deactivated: data.deactivated,
      totalActive: data.totalActive,
    },
  };
}

/** 목(mock) 데이터 버전 */
async function syncMock() {
  // 네가 준 명세 예시 그대로 사용
  const data: SyncResponse = {
    message: "카드 정보가 최신으로 갱신되었습니다",
    syncedAt: "2025-09-09T22:00:00",
    added: 2,
    updated: 3,
    deactivated: 1,
    totalActive: 5,
    cards: [
      {
        userCardId: 101,
        issuer: { code: "KB", name: "KB국민카드" },
        cardName: "국민 탄탄적립 카드",
        last4: "1234",
        isActive: true,
      },
      {
        userCardId: 102,
        issuer: { code: "HANA", name: "하나카드" },
        cardName: "하나 쇼핑 플러스",
        last4: "5678",
        isActive: false,
      },
      {
        userCardId: 202,
        issuer: { code: "SS", name: "삼성카드" },
        cardName: "삼성 탭탭오",
        last4: "5678",
        isActive: false,
      },
      {
        userCardId: 303,
        issuer: { code: "SH", name: "하나카드" },
        cardName: "신한 Deep",
        last4: "9999",
        isActive: true,
      },
      {
        userCardId: 101,
        issuer: { code: "KB2", name: "KB국민카드-전통시장온누리" },
        cardName: "KB국민카드-전통시장온누리",
        last4: "1972",
        isActive: true,
      },
    ],
  };
  // 네트워크 느낌을 위한 가짜 지연
  await new Promise((r) => setTimeout(r, 600));
  return {
    list: data.cards.map(mapApiToUserCard),
    meta: {
      message: data.message,
      syncedAt: data.syncedAt,
      added: data.added,
      updated: data.updated,
      deactivated: data.deactivated,
      totalActive: data.totalActive,
    },
  };
}

/** 외부에 노출되는 동기화 함수 */
export async function syncUserCards(userId: string | number) {
  return USE_REAL_API ? syncReal(userId) : syncMock();
}
