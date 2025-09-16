export interface BenefitCategory {
  categoryId: number;
  categoryName: string; // 예: "카페/간식"
}

export interface CardBenefit {
  franchiseId: number;
  franchiseName: string; // 예: "스타벅스"
  discountRate: number; // 20.0 → % 값
  representativeCategory: BenefitCategory;
}

export interface CardBenefitsResponse {
  userCardId: number;
  card: {
    cardUniqueNo: string;
    issuerCode: string;
    issuerName: string;
    cardName: string;
    cardTypeName: string;
  };
  benefits: CardBenefit[];
}
