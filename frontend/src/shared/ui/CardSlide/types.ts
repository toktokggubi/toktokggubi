// shared/ui/CardSlide/types.ts
import type { ImageSourcePropType } from "react-native";

export interface CardSlideData {
  userCardId: number;
  issuerName: string;
  cardName: string;
  cardType: "CHECK" | "CREDIT";
  last4: string;
  isActive: boolean;

  /** 서버에서 오는 이미지 URL (기프티콘과 동일) */
  imageUrl?: string;

  /** 레거시 지원: 과거 매핑 테이블용 코드가 있는 경우에만 사용 */
  cardIssuerCode?: string;
}

export interface CardSlideProps {
  card: CardSlideData;
}
