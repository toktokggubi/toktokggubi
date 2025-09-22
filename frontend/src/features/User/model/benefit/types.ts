export interface BenefitCategory {
  categoryId: number;
  categoryName: string;
}

export interface CardBenefit {
  franchiseId: number;
  franchiseName: string;
  discountRate: number;
  representativeCategory?: BenefitCategory; // 서버 응답엔 없을 수 있어 optional 권장
}

export interface CardBenefitsResponse {
  userCardId: number;
  benefits: CardBenefit[];
  card?: {
    cardUniqueNo: string;
    issuerCode: string;
    issuerName: string;
    cardName: string;
    cardTypeName: string;
  };
}
