// 공용 카테고리 값(슬러그) - 바꾸면 전역 동기화됨
export const CATEGORY_VALUES = [
  "food", // 식비
  "cafe_snack", // 카페/간식
  "alcohol_entertain", // 술/유흥
  "life", // 생활
  "shopping", // 쇼핑
  "beauty", // 뷰티/미용
  "transport", // 교통
  "car", // 자동차
  "health", // 의료/건강
  "culture", // 문화
] as const;

export type Category = (typeof CATEGORY_VALUES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  food: "식비",
  cafe_snack: "카페/간식",
  alcohol_entertain: "술/유흥",
  life: "생활",
  shopping: "쇼핑",
  beauty: "뷰티/미용",
  transport: "교통",
  car: "자동차",
  health: "의료/건강",
  culture: "문화",
};
