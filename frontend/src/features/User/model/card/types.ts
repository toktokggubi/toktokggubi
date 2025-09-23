import type { CardItem } from "@/features/User/api/wallet.fetchers";

export interface UserCardVM {
  userCardId: number;
  issuerName: string;
  cardName: string;
  cardType: "CHECK" | "CREDIT";
  last4: string;
  isActive: boolean;
  imageUrl?: string; // 기프티콘과 동일하게 imageUrl로 변경
}

/** 서버 → 화면 뷰모델 */
export function mapCardToVM(item: CardItem): UserCardVM {
  const last4 = item.maskedCardNo.slice(-4);
  return {
    userCardId: item.userCardId,
    issuerName: item.issuerName,
    cardName: item.cardName,
    cardType: item.cardType,
    last4,
    isActive: item.active,
    imageUrl: item.imageUrl || undefined, // null 체크 추가
  };
}
