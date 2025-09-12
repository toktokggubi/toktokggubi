export interface KakaoPlace {
  place_name: string; // "유성 스타벅스 NC점"
  address_name: string; // 지번주소
  road_address_name?: string | null; // 도로명주소
  x: string; // 경도
  y: string; // 위도
}
