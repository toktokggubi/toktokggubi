import type { CardItem } from "@/features/User/api/wallet.fetchers";
import { normalizeImageUrl } from "@/features/User/utils/imageUtils";

export interface UserCardVM {
  userCardId: number;
  issuerName: string;
  cardName: string;
  cardType: "CHECK" | "CREDIT";
  last4: string;
  isActive: boolean;
  imageUrl?: string; // 기프티콘과 동일하게 imageUrl로 변경
  cardIssuerCode?: string; // CardSlide 호환성을 위한 필드
}

/** 서버 → 화면 뷰모델 */
export function mapCardToVM(item: CardItem): UserCardVM {
  const last4 = item.maskedCardNo.slice(-4);
  
  // issuerName에서 카드사 코드 추출 (CardSlide 호환성)
  const getIssuerCode = (issuerName: string): string => {
    const name = issuerName.toLowerCase();
    if (name.includes('국민') || name.includes('kb')) return 'KB';
    if (name.includes('신한') || name.includes('shinhan')) return 'SH';
    if (name.includes('삼성') || name.includes('samsung')) return 'SS';
    if (name.includes('하나') || name.includes('hana')) return 'HANA';
    if (name.includes('ibk') || name.includes('기업은행')) return 'IBK';
    return 'UNKNOWN';
  };
  
  return {
    userCardId: item.userCardId,
    issuerName: item.issuerName,
    cardName: item.cardName,
    cardType: item.cardType,
    last4,
    isActive: item.active,
    imageUrl: item.imageUrl ? normalizeImageUrl(item.imageUrl) : undefined, // 상대 경로를 절대 URL로 변환
    cardIssuerCode: getIssuerCode(item.issuerName), // CardSlide 호환성
  };
}
