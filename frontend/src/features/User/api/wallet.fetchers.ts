import { http } from "@/shared/api/http";
import { z } from "zod";
import { WALLET_ENDPOINTS } from "./wallet.endpoints";

/** -------- 카드 목록 -------- */
const CardItemZ = z.object({
  userCardId: z.number(),
  issuerName: z.string(),
  cardName: z.string(),
  cardType: z.enum(["CHECK", "CREDIT"]),
  maskedCardNo: z.string(),
  active: z.boolean(),
  imageUrl: z.string().nullable().optional(),
});
const CardListResponseZ = z.object({
  cards: z.array(CardItemZ),
});
export type CardItem = z.infer<typeof CardItemZ>;
export type CardListResponse = z.infer<typeof CardListResponseZ>;

export async function fetchUserCards(): Promise<CardListResponse> {
  const { data } = await http.get(WALLET_ENDPOINTS.cards);
  return CardListResponseZ.parse(data);
}

/** -------- 카드별 혜택 -------- */
// 서버 샘플엔 card 블록이 없으므로 card는 optional로 파싱
const BenefitZ = z.object({
  franchiseId: z.number(),
  franchiseName: z.string(),
  discountRate: z.number(),
});
const CardBenefitsResponseZ = z.object({
  userCardId: z.number(),
  benefits: z.array(BenefitZ),
  card: z
    .object({
      cardUniqueNo: z.string(),
      issuerCode: z.string(),
      issuerName: z.string(),
      cardName: z.string(),
      cardTypeName: z.string(),
    })
    .optional(),
});
export type Benefit = z.infer<typeof BenefitZ>;
export type CardBenefitsResponse = z.infer<typeof CardBenefitsResponseZ>;

export async function fetchCardBenefits(
  userCardId: number
): Promise<CardBenefitsResponse> {
  const { data } = await http.get(WALLET_ENDPOINTS.cardBenefits(userCardId));
  return CardBenefitsResponseZ.parse(data);
}
