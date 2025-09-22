import type { CardItem } from "@/features/User/api/wallet.fetchers";

export interface UserCardVM {
  userCardId: number;
  issuerName: string;
  cardName: string;
  cardType: "CHECK" | "CREDIT";
  last4: string;
  isActive: boolean;
  image?: { uri: string } | undefined;
}

/** 서버 → 화면 뷰모델 */
export function mapCardToVM(item: CardItem): UserCardVM {
  const last4 = item.maskedCardNo.slice(-4);
  const image = item.imageUrl ? { uri: item.imageUrl } : undefined;
  return {
    userCardId: item.userCardId,
    issuerName: item.issuerName,
    cardName: item.cardName,
    cardType: item.cardType,
    last4,
    isActive: item.active,
    image,
  };
}
