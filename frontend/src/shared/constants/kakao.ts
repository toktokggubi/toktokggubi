export const KAKAO_CATEGORY_CODES = {
  GAS_STATION: "OL7", // 주유소, 충전소
  CONVENIENCE: "CS2", // 편의점
  MART: "MT1", // 대형마트
  LODGING: "AD5", // 숙박
  FOOD: "FD6", // 음식점
  CAFE: "CE7", // 카페
  HOSPITAL: "HP8", // 병원
  PHARMACY: "PM9", // 약국
  CINEMA: "CT1", // 영화관
  SUPERMARKET: "MT1", // 대형마트 (이마트 등)
  // 추가 카테고리들
  BAKERY: "CE7", // 베이커리 (카페와 동일)
  FAST_FOOD: "FD6", // 패스트푸드 (음식점과 동일)
  SHOPPING: "MT1", // 쇼핑몰 (대형마트와 동일)
} as const;

export type KakaoCategoryCode =
  (typeof KAKAO_CATEGORY_CODES)[keyof typeof KAKAO_CATEGORY_CODES];
