import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { fetchNearbyPlaces } from "@/shared/api/kakao-location";
import type { KakaoPlace } from "@/shared/types/location.types";

// Real implementation
export function useNearbyPlacesReal(
  apiKey: string,
  keywords: string[]
): KakaoPlace[] {
  const [places, setPlaces] = useState<KakaoPlace[]>([]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const loc = await Location.getCurrentPositionAsync({});
      const results: KakaoPlace[] = [];

      for (const kw of keywords) {
        const docs = await fetchNearbyPlaces(
          loc.coords.longitude,
          loc.coords.latitude,
          kw,
          apiKey
        );
        results.push(...docs);
      }

      setPlaces(results);
    })();
  }, [apiKey, JSON.stringify(keywords)]);

  return places;
}

// Mock implementation
export function useNearbyPlacesMock(
  apiKey: string,
  keywords: string[]
): KakaoPlace[] {
  const [places, setPlaces] = useState<KakaoPlace[]>([]);

  useEffect(() => {
    // 1초 뒤에 주변 가맹점들 있다고 가정
    const timer = setTimeout(() => {
      setPlaces([
        {
          place_name: "유성 스타벅스 NC점",
          address_name: "대전 유성구 봉명동 123-4",
          road_address_name: "대전 유성구 대학로 123",
          x: "127.12345",
          y: "36.12345",
        },
        {
          place_name: "맥도날드 유성점",
          address_name: "대전 유성구 봉명동 125-6",
          road_address_name: "대전 유성구 대학로 125",
          x: "127.12350",
          y: "36.12350",
        },
        {
          place_name: "버거킹 유성NC점",
          address_name: "대전 유성구 봉명동 127-8",
          road_address_name: "대전 유성구 대학로 127",
          x: "127.12355",
          y: "36.12355",
        },
        {
          place_name: "CGV 유성점",
          address_name: "대전 유성구 봉명동 130-10",
          road_address_name: "대전 유성구 대학로 130",
          x: "127.12360",
          y: "36.12360",
        },
      ]);
    }, 1000);
    return () => clearTimeout(timer);
  }, [apiKey, JSON.stringify(keywords)]);

  return places;
}

// 이 부분만 바꿔서 real과 mock을 교체할 수 있습니다
// Mock을 사용하려면: useNearbyPlacesMock
// Real을 사용하려면: useNearbyPlacesReal
export const useNearbyPlaces: (
  apiKey: string,
  keywords: string[]
) => KakaoPlace[] = useNearbyPlacesReal;
