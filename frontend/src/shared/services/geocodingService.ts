// frontend/src/shared/services/geocodingService.ts
import { fetchNearbyPlaces } from "@/shared/api/kakao-location";
import type { KakaoPlace } from "@/shared/types/location.types";

const KAKAO_KEY = process.env.EXPO_PUBLIC_KAKAO_REST_KEY!;

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  address?: string;
  placeName?: string;
}

/**
 * 매장명을 좌표로 변환하는 지오코딩 함수
 * @param storeName 매장명
 * @param fallbackLat 기본 위도 (삼성화재 유성연수원)
 * @param fallbackLng 기본 경도 (삼성화재 유성연수원)
 * @returns 좌표 정보
 */
export async function geocodeStoreName(
  storeName: string,
  fallbackLat: number = 36.3508, // 삼성화재 유성연수원
  fallbackLng: number = 127.2985
): Promise<GeocodingResult> {
  try {
    if (!KAKAO_KEY) {
      console.warn("카카오 API 키가 설정되지 않았습니다.");
      return {
        latitude: fallbackLat,
        longitude: fallbackLng,
        placeName: storeName,
      };
    }

    // 매장명으로 장소 검색
    const places = await fetchNearbyPlaces(
      fallbackLng, // 대전 유성구 중심 경도
      fallbackLat, // 대전 유성구 중심 위도
      storeName,
      KAKAO_KEY,
      {
        radius: 10000, // 10km 반경
        size: 5, // 최대 5개 결과
        page: 1,
        sort: "accuracy", // 정확도 순
      }
    );

    if (places && places.length > 0) {
      // 첫 번째 결과 사용
      const place = places[0];
      return {
        latitude: parseFloat(place.y),
        longitude: parseFloat(place.x),
        address: place.address_name,
        placeName: place.place_name,
      };
    }

    // 검색 결과가 없으면 기본 좌표 반환
    console.warn(`매장 "${storeName}"을 찾을 수 없습니다. 기본 좌표를 사용합니다.`);
    return {
      latitude: fallbackLat,
      longitude: fallbackLng,
      placeName: storeName,
    };
  } catch (error) {
    console.error(`지오코딩 실패 (${storeName}):`, error);
    return {
      latitude: fallbackLat,
      longitude: fallbackLng,
      placeName: storeName,
    };
  }
}

/**
 * 여러 매장명을 일괄 지오코딩하는 함수
 * @param storeNames 매장명 배열
 * @param fallbackLat 기본 위도
 * @param fallbackLng 기본 경도
 * @returns 좌표 정보 배열
 */
export async function geocodeMultipleStores(
  storeNames: string[],
  fallbackLat: number = 36.3508, // 삼성화재 유성연수원
  fallbackLng: number = 127.2985
): Promise<GeocodingResult[]> {
  const results: GeocodingResult[] = [];
  
  // API 호출 제한을 고려하여 순차적으로 처리
  for (const storeName of storeNames) {
    try {
      const result = await geocodeStoreName(storeName, fallbackLat, fallbackLng);
      results.push(result);
      
      // API 호출 간격 조절 (100ms)
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`매장 "${storeName}" 지오코딩 실패:`, error);
      results.push({
        latitude: fallbackLat,
        longitude: fallbackLng,
        placeName: storeName,
      });
    }
  }
  
  return results;
}

/**
 * 매장명에서 브랜드명을 추출하여 더 정확한 검색을 위한 함수
 * @param storeName 원본 매장명
 * @returns 정제된 검색어
 */
export function refineStoreNameForSearch(storeName: string): string {
  // 브랜드명 매핑
  const brandMappings: { [key: string]: string } = {
    "이디야커피": "이디야",
    "스타벅스": "스타벅스",
    "맥도날드": "맥도날드",
    "버거킹": "버거킹",
    "롯데리아": "롯데리아",
    "맘스터치": "맘스터치",
    "교촌치킨": "교촌치킨",
    "BHC": "BHC치킨",
    "네이버페이": "",
    "삼성": "",
    "카드": "",
  };

  let refinedName = storeName;
  
  // 브랜드명이 포함된 경우 해당 브랜드명으로 검색
  for (const [brand, searchTerm] of Object.entries(brandMappings)) {
    if (storeName.includes(brand)) {
      if (searchTerm) {
        refinedName = searchTerm;
        break;
      } else {
        // 특정 키워드는 제거
        refinedName = storeName.replace(brand, "").trim();
      }
    }
  }

  // 점, 지점명 제거 (예: "스타벅스 NC점" -> "스타벅스")
  refinedName = refinedName.replace(/\s*(점|지점|본점|직영점|프랜차이즈).*$/, "");
  
  // 불필요한 공백 제거
  refinedName = refinedName.trim();
  
  return refinedName || storeName;
}
