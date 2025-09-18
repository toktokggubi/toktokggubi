// 카테고리명 → PNG 아이콘 매핑
export const CATEGORY_ICON_BY_NAME: Record<string, any> = {
  식비: require("@/assets/images/illustration/category_food.png"),
  "카페/간식": require("@/assets/images/illustration/category_cafe.png"),
  "술/유흥": require("@/assets/images/illustration/category_nightlife.png"),
  생활: require("@/assets/images/illustration/category_life.png"),
  쇼핑: require("@/assets/images/illustration/category_shopping.png"),
  "뷰티/미용": require("@/assets/images/illustration/category_beauty.png"),
  교통: require("@/assets/images/illustration/category_trans.png"),
  자동차: require("@/assets/images/illustration/category_car.png"),
  "의료/건강": require("@/assets/images/illustration/category_medical.png"),
  문화: require("@/assets/images/illustration/category_entertainment.png"),
  기타: require("@/assets/images/illustration/category_shopping.png"), // 폴백 아이콘 사용
} as const;

// 폴백(없을 때)
export const CATEGORY_ICON_FALLBACK = require("@/assets/images/illustration/category_shopping.png");

export type CategoryName = keyof typeof CATEGORY_ICON_BY_NAME;
