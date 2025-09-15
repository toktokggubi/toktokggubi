export interface KakaoPlace {
  place_name: string; // "유성 스타벅스 NC점"
  address_name: string; // 지번주소
  road_address_name?: string | null; // 도로명주소
  x: string; // 경도
  y: string; // 위도
  distance?: string; // 거리 (미터)
  id?: string; // 장소 ID
  phone?: string; // 전화번호
  place_url?: string; // 장소 URL
  category_group_code?: string; // 카테고리 그룹 코드
  category_group_name?: string; // 카테고리 그룹명
  category_name?: string; // 카테고리명
}
