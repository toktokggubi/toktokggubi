import { z } from "zod";
import type { CardBenefitsResponse } from "@/features/User/model/benefit/types";

// 실제/목 전환 스위치
const USE_REAL_API = false;

// Zod 스키마 (명세서 기준)
const BenefitCategoryZ = z.object({
  categoryId: z.number(),
  categoryName: z.string(),
});

const CardBenefitZ = z.object({
  franchiseId: z.number(),
  franchiseName: z.string(),
  discountRate: z.number(),
  representativeCategory: BenefitCategoryZ,
});

const CardBenefitsResponseZ = z.object({
  userCardId: z.number(),
  card: z.object({
    cardUniqueNo: z.string(),
    issuerCode: z.string(),
    issuerName: z.string(),
    cardName: z.string(),
    cardTypeName: z.string(),
  }),
  benefits: z.array(CardBenefitZ),
});

async function fetchReal(userCardId: number): Promise<CardBenefitsResponse> {
  const res = await fetch(`/wallet/cards/${userCardId}/benefits`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`benefits fetch failed: ${res.status}`);
  const json = await res.json();
  return CardBenefitsResponseZ.parse(json);
}

async function fetchMock(userCardId: number): Promise<CardBenefitsResponse> {
  // 명세서 예시 + 몇 개 더
  const json = {
    userCardId,
    card: {
      cardUniqueNo: "CARD-123",
      issuerCode: "088",
      issuerName: "신한카드",
      cardName: "신한 청춘 체크",
      cardTypeName: "CHECK",
    },
    benefits: [
      {
        franchiseId: 10,
        franchiseName: "스타벅스",
        discountRate: 20.0,
        representativeCategory: { categoryId: 2, categoryName: "카페/간식" },
      },
      {
        franchiseId: 12,
        franchiseName: "이마트",
        discountRate: 5.0,
        representativeCategory: { categoryId: 4, categoryName: "생활" },
      },
      {
        franchiseId: 99,
        franchiseName: "CGV",
        discountRate: 10.0,
        representativeCategory: { categoryId: 7, categoryName: "문화" },
      },
    ],
  };
  await new Promise((r) => setTimeout(r, 400));
  return CardBenefitsResponseZ.parse(json);
}

export async function getCardBenefits(userCardId: number) {
  return USE_REAL_API ? fetchReal(userCardId) : fetchMock(userCardId);
}
