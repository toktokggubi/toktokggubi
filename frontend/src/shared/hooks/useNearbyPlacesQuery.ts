// src/shared/hooks/useNearbyPlacesQuery.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useMemo } from "react";
import * as Location from "expo-location";
import { fetchNearbyPlaces, fetchNearbyPlacesByCategory } from "@/shared/api/kakao-location";
import type { KakaoPlace } from "@/shared/types/location.types";
import type { KakaoCategoryCode } from "@/shared/constants/kakao";

export type NearbyPlacesOptions = {
  radius?: number;
  size?: number;
  pages?: number;
  sort?: "distance" | "accuracy";
  dedupe?: boolean;
  delayMsBetweenCalls?: number;
  categoryCodes?: KakaoCategoryCode[];
};


// 주변 장소 검색 함수
const searchNearbyPlaces = async (
  lat: number,
  lng: number,
  apiKey: string,
  options: NearbyPlacesOptions & { keywords?: string[] }
): Promise<KakaoPlace[]> => {
  const results: KakaoPlace[] = [];
  const categories = options.categoryCodes && options.categoryCodes.length > 0 ? options.categoryCodes : [];

  if (categories.length > 0) {
    // 카테고리별 검색
    for (const cat of categories) {
      for (let page = 1; page <= (options.pages || 1); page++) {
        try {
          const docs = await fetchNearbyPlacesByCategory(lng, lat, cat, apiKey, {
            radius: options.radius,
            size: options.size,
            page,
            sort: options.sort,
          });

          results.push(...docs);
        } catch (error) {
          console.error(`❌ 카테고리 "${cat}" API 호출 실패:`, error);
        }

        if (options.delayMsBetweenCalls && options.delayMsBetweenCalls > 0) {
          await new Promise(resolve => setTimeout(resolve, options.delayMsBetweenCalls));
        }
      }
    }
  } else if (options.keywords && options.keywords.length > 0) {
    // 키워드 검색
    for (const kw of options.keywords) {
      for (let page = 1; page <= (options.pages || 1); page++) {
        try {
          const docs = await fetchNearbyPlaces(lng, lat, kw.trim(), apiKey, {
            radius: options.radius,
            size: options.size,
            page,
            sort: options.sort,
          });

          results.push(...docs);
        } catch (error) {
          console.error(`❌ 키워드 API 호출 실패:`, error);
        }

        if (options.delayMsBetweenCalls && options.delayMsBetweenCalls > 0) {
          await new Promise(resolve => setTimeout(resolve, options.delayMsBetweenCalls));
        }
      }
    }
  }

  // 중복 제거
  if (options.dedupe !== false) {
    const uniquePlaces = new Map();
    results.forEach(place => {
      const key = `${place.place_name}-${place.x}-${place.y}`;
      if (!uniquePlaces.has(key)) {
        uniquePlaces.set(key, place);
      }
    });
    return Array.from(uniquePlaces.values());
  }

  return results;
};

export function useNearbyPlacesQuery(
  apiKey: string,
  keywords: string[],
  options?: NearbyPlacesOptions
): { 
  places: KakaoPlace[]; 
  loading: boolean; 
  error: string | null; 
  isFetching: boolean;
  refetch: () => void;
  invalidateCache: () => void;
} {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // 위치 권한 요청 및 현재 위치 가져오기
  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocationError("위치 권한이 거부되었습니다.");
          return;
        }

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        setLocation({
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
        });
      } catch (error) {
        setLocationError("위치를 가져올 수 없습니다.");
      }
    };

    getCurrentLocation();
  }, []);

  // options를 안정화하여 불필요한 리렌더링 방지
  const stableOptions = useMemo(() => ({ keywords, ...options }), [keywords, options]);
  
  // 위치 기반 캐시 키 (100m 단위로 그룹화)
  const locationKey = useMemo(() => {
    if (!location) return null;
    // 100m 단위로 반올림 (약 0.001도)
    const roundedLat = Math.round(location.lat * 1000) / 1000;
    const roundedLng = Math.round(location.lng * 1000) / 1000;
    return [roundedLat, roundedLng];
  }, [location]);
  
  // 위치 기반 캐시 키 사용
  const queryKey = useMemo(() => [
    'nearby-places',
    locationKey,
    stableOptions
  ], [locationKey, stableOptions]);
  
  const {
    data: places,
    isLoading,
    error,
    isFetching,
    refetch,
  } = useQuery<KakaoPlace[]>({
    queryKey,
    queryFn: () => {
      if (!location) throw new Error("위치 정보가 없습니다.");
      return searchNearbyPlaces(location.lat, location.lng, apiKey, stableOptions);
    },
    enabled: !!location && !!apiKey,
    staleTime: Infinity, // 캐시를 영원히 유지 (수동으로만 업데이트)
    gcTime: Infinity, // 메모리에서도 영원히 보관 (v5에서 cacheTime → gcTime)
    refetchOnWindowFocus: false, // 윈도우 포커스 시에도 캐시 사용
    refetchOnMount: false, // 마운트 시에는 캐시 사용
    refetchOnReconnect: false, // 네트워크 재연결 시에도 캐시 사용
    retry: 1, // 실패 시 1번만 재시도
    refetchInterval: false, // 자동 refetch 비활성화
    refetchIntervalInBackground: false, // 백그라운드 refetch 비활성화
  });


  // 캐시 무효화 함수 (Pull-to-Refresh용)
  const invalidateCache = () => {
    queryClient.invalidateQueries({ queryKey: ['nearby-places'] });
  };

  return {
    places: places || [],
    loading: isLoading,
    error: error?.message || locationError,
    isFetching,
    refetch,
    invalidateCache,
  };
}
