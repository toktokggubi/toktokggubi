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
  // 카드별로 다른 혜택 제공
  const cardBenefits = {
    101: {
      // 국민 청춘카드 - 카페/음식점 중심
      card: {
        cardUniqueNo: "CARD-101",
        issuerCode: "004",
        issuerName: "KB국민카드",
        cardName: "국민 청춘카드",
        cardTypeName: "CREDIT",
      },
      benefits: [
        {
          franchiseId: 10,
          franchiseName: "스타벅스",
          discountRate: 25.0,
          representativeCategory: { categoryId: 2, categoryName: "카페/간식" },
        },
        {
          franchiseId: 15,
          franchiseName: "맘스터치",
          discountRate: 20.0,
          representativeCategory: { categoryId: 3, categoryName: "음식점" },
        },
        {
          franchiseId: 20,
          franchiseName: "세븐일레븐",
          discountRate: 10.0,
          representativeCategory: { categoryId: 5, categoryName: "편의점" },
        },
      ],
    },
    202: {
      // 삼성 탭탭오 - 쇼핑/생활 중심
      card: {
        cardUniqueNo: "CARD-202",
        issuerCode: "088",
        issuerName: "삼성카드",
        cardName: "삼성 탭탭오",
        cardTypeName: "CREDIT",
      },
      benefits: [
        {
          franchiseId: 12,
          franchiseName: "이마트",
          discountRate: 15.0,
          representativeCategory: { categoryId: 4, categoryName: "생활" },
        },
        {
          franchiseId: 99,
          franchiseName: "CGV",
          discountRate: 12.0,
          representativeCategory: { categoryId: 7, categoryName: "문화" },
        },
        {
          franchiseId: 20,
          franchiseName: "세븐일레븐",
          discountRate: 8.0,
          representativeCategory: { categoryId: 5, categoryName: "편의점" },
        },
      ],
    },
    303: {
      // 신한 Deep - 문화/엔터테인먼트 중심
      card: {
        cardUniqueNo: "CARD-303",
        issuerCode: "088",
        issuerName: "신한카드",
        cardName: "신한 Deep",
        cardTypeName: "CREDIT",
      },
      benefits: [
        {
          franchiseId: 99,
          franchiseName: "CGV",
          discountRate: 30.0,
          representativeCategory: { categoryId: 7, categoryName: "문화" },
        },
        {
          franchiseId: 10,
          franchiseName: "스타벅스",
          discountRate: 15.0,
          representativeCategory: { categoryId: 2, categoryName: "카페/간식" },
        },
        {
          franchiseId: 15,
          franchiseName: "맘스터치",
          discountRate: 10.0,
          representativeCategory: { categoryId: 3, categoryName: "음식점" },
        },
        {
          franchiseId: 25,
          franchiseName: "GS25",
          discountRate: 12.0,
          representativeCategory: { categoryId: 5, categoryName: "편의점" },
        },
        {
          franchiseId: 30,
          franchiseName: "CU",
          discountRate: 8.0,
          representativeCategory: { categoryId: 5, categoryName: "편의점" },
        },
      ],
    },
  };

  // 기본값 (알 수 없는 카드)
  const defaultCard = {
    card: {
      cardUniqueNo: "CARD-UNKNOWN",
      issuerCode: "000",
      issuerName: "알 수 없는 카드",
      cardName: "알 수 없는 카드",
      cardTypeName: "UNKNOWN",
    },
    benefits: [],
  };

  const cardData = cardBenefits[userCardId as keyof typeof cardBenefits] || defaultCard;
  
  const json = {
    userCardId,
    ...cardData,
  };
  
  await new Promise((r) => setTimeout(r, 400));
  return CardBenefitsResponseZ.parse(json);
}

export async function getCardBenefits(userCardId: number) {
  return USE_REAL_API ? fetchReal(userCardId) : fetchMock(userCardId);
}
