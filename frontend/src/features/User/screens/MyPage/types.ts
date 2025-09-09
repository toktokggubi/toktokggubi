// 이미 타입 파일이 있다면 여기에 필드만 추가해도 됨
export interface UserCard {
  userCardId: number;
  cardName: string;
  cardIssuerCode: string; // 'KB' | 'SH' ...
  last4: string; // '1234'
  isActive: boolean;
  image: any; // require(...) 결과 (정적 이미지)
}

// RN/Expo 정적 이미지는 '리터럴 require'만 가능하므로
// 매퍼 객체 안에서 미리 require 해 둔다.
export const CARD_IMAGE_BY_ISSUER: Record<string, any> = {
  KB: require("@/assets/dummy/card-kb.png"),
  SS: require("@/assets/dummy/card-samsung.png"), // 삼성카드 (코드 예: SS)
  SH: require("@/assets/dummy/card-sh.png"), // 신한카드
};

// fallback (모르는 코드일 때)
export const DEFAULT_CARD_IMAGE = CARD_IMAGE_BY_ISSUER.KB;
