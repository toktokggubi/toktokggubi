import { z } from "zod";
import type { KakaoPlace } from "@/shared/types/location.types";
import type { KakaoCategoryCode } from "@/shared/constants/kakao";

const KakaoPlaceZ = z.object({
  documents: z.array(
    z.object({
      place_name: z.string(),
      address_name: z.string(),
      road_address_name: z.string().nullable().optional(),
      x: z.string(), // 경도
      y: z.string(), // 위도
      distance: z.string().optional(), // 거리 (미터)
      id: z.string().optional(), // 장소 ID
      phone: z.string().optional(), // 전화번호
      place_url: z.string().optional(), // 장소 URL
      category_group_code: z.string().optional(), // 카테고리 그룹 코드
      category_group_name: z.string().optional(), // 카테고리 그룹명
      category_name: z.string().optional(), // 카테고리명
    })
  ),
});

type FetchNearbyOptions = {
  radius?: number;
  size?: number;
  page?: number;
  sort?: "accuracy" | "distance";
  category_group_code?: KakaoCategoryCode;
};

export async function fetchNearbyPlaces(
  lng: number,
  lat: number,
  query: string,
  apiKey: string,
  opts: FetchNearbyOptions = {}
): Promise<KakaoPlace[]> {
  const {
    radius = 1500,
    size = 15,
    page = 1,
    sort = "distance",
    category_group_code,
  } = opts;

  // 카테고리만으로 검색할 때는 category.json 엔드포인트 사용
  const endpoint = category_group_code && !query.trim() 
    ? "https://dapi.kakao.com/v2/local/search/category.json"
    : "https://dapi.kakao.com/v2/local/search/keyword.json";
    
  const url = new URL(endpoint);
  
  // 카테고리 검색일 때는 query 파라미터를 사용하지 않음
  if (query.trim() && endpoint.includes("keyword")) {
    url.searchParams.set("query", query);
  }
  
  url.searchParams.set("x", String(lng));
  url.searchParams.set("y", String(lat));
  url.searchParams.set("radius", String(radius));
  url.searchParams.set("size", String(size));
  url.searchParams.set("page", String(page));
  url.searchParams.set("sort", sort);
  
  if (category_group_code) {
    url.searchParams.set("category_group_code", category_group_code);
  }



  const res = await fetch(url.toString(), {
    headers: { 
      'Authorization': `KakaoAK ${apiKey}`,
      'KA': 'sdk/1.0 os/android origin/com.technologia.toktokggubi'
    },
  });
  
  
  if (!res.ok) {
    const errorText = await res.text();
  
    throw new Error(`kakao keyword search failed: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  const documents = KakaoPlaceZ.parse(json).documents;
  
  
  return documents;
}

// 카테고리로 주변 장소 검색하는 전용 함수
export async function fetchNearbyPlacesByCategory(
  lng: number,
  lat: number,
  categoryCode: KakaoCategoryCode,
  apiKey: string,
  opts: Omit<FetchNearbyOptions, 'category_group_code'> = {}
): Promise<KakaoPlace[]> {
  const {
    radius = 1500,
    size = 15,
    page = 1,
    sort = "distance",
  } = opts;

  const url = new URL("https://dapi.kakao.com/v2/local/search/category.json");
  url.searchParams.set("x", String(lng));
  url.searchParams.set("y", String(lat));
  url.searchParams.set("radius", String(radius));
  url.searchParams.set("size", String(size));
  url.searchParams.set("page", String(page));
  url.searchParams.set("sort", sort);
  url.searchParams.set("category_group_code", categoryCode);


  const res = await fetch(url.toString(), {
    headers: { 
      'Authorization': `KakaoAK ${apiKey}`,
      'KA': 'sdk/1.0 os/android origin/com.technologia.toktokggubi'
    },
  });
  
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`카테고리 검색 실패: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  const documents = KakaoPlaceZ.parse(json).documents;
  
  
  return documents;
}
