import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import PaymentTemplate from "../templates/PaymentTemplate";
import { getUserCards } from "@/features/User/api/cardService";
import type { UserCard } from "@/features/User/screens/MyPageScreen/types";

import { useCardBenefits } from "@/features/User/model/benefit/hooks";
import BenefitsList from "@/features/User/ui/BenefitsList";

import { colors } from "@/shared/constants/colors";

import { DUMMY_GIFTICONS } from "@/features/Pay/model/dummyGifticons";
import type { Gifticon } from "@/shared/types/gifticon";

// real과 mock 교체 - useNearbyPlaces.ts 파일에서 export 부분만 바꾸면 됩니다
import { useNearbyPlacesQuery } from "@/shared/hooks/useNearbyPlacesQuery";
import NearbyPlacesBottomSheet from "../ui/NearbyPlacesBottomSheet";
import LoadingIndicator from "../ui/LoadingIndicator";
import type { BottomSheetRef } from "@/features/Auth/ui/BottomSheetList/types";
import type { KakaoPlace } from "@/shared/types/location.types";
import {
  KAKAO_CATEGORY_CODES,
  type KakaoCategoryCode,
} from "@/shared/constants/kakao";

const KAKAO_KEY = process.env.EXPO_PUBLIC_KAKAO_REST_KEY!;

// API 키 확인 로그

// 주변에서 검색할 카테고리 코드들 (카드 혜택과 관련된 모든 카테고리)
const SEARCH_CATEGORIES: KakaoCategoryCode[] = [
  KAKAO_CATEGORY_CODES.CAFE, // 카페 (스타벅스, 커피빈 등)
  KAKAO_CATEGORY_CODES.FOOD, // 음식점 (맥도날드, 버거킹 등)
  KAKAO_CATEGORY_CODES.SUPERMARKET, // 대형마트 (이마트, 롯데마트 등)
  KAKAO_CATEGORY_CODES.CINEMA, // 영화관 (CGV, 롯데시네마 등)
  KAKAO_CATEGORY_CODES.CONVENIENCE, // 편의점 (CU, GS25 등)
];

// 브랜드 매칭 규칙을 컴포넌트 외부로 이동 (성능 최적화)
const BRAND_MAPPINGS: { [key: string]: string[] } = {
  스타벅스: ["starbucks", "스타벅스"],
  이마트: ["emart", "이마트", "이마트몰"],
  CGV: ["cgv", "씨지브이"],
  맥도날드: ["mcdonald", "맥도날드", "맥도널드"],
  버거킹: ["burgerking", "버거킹"],
  맘스터치: ["momstouch", "맘스터치", "맘스터치치킨"],
  세븐일레븐: ["7eleven", "세븐일레븐", "7-eleven", "세븐"],
  롯데마트: ["lottemart", "롯데마트"],
  CU: ["cu", "씨유"],
  GS25: ["gs25", "지에스25"],
};

// 장소명이 카드 혜택과 매칭되는지 확인하는 함수
const isPlaceMatchingBenefit = (
  placeName: string,
  benefitName: string
): boolean => {
  const place = placeName.toLowerCase();
  const benefit = benefitName.toLowerCase();

  // 정확한 매칭
  if (place.includes(benefit) || benefit.includes(place)) {
    return true;
  }

  // 브랜드별 매칭 규칙
  for (const [brand, variations] of Object.entries(BRAND_MAPPINGS)) {
    if (benefit.includes(brand)) {
      return variations.some((variation) => place.includes(variation));
    }
  }

  return false;
};

// 프로젝트의 로딩/에러 컴포넌트로 교체 가능
const LoadingCard = () => null;
const ErrorCard = ({ onRetry }: { onRetry: () => void }) => null;

export default function PaymentScreen() {
  const [tab, setTab] = useState(0);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const activeCardIndexRef = useRef(0);
  
  // activeCardIndex와 ref 동기화
  useEffect(() => {
    activeCardIndexRef.current = activeCardIndex;
  }, [activeCardIndex]);
  
  // activeCardIndex가 0으로 리셋되는 것을 방지
  const handleActiveCardChange = useCallback((index: number, cardId: number) => {
    setActiveCardIndex(index);
  }, []);
  
  // 탭 변경 시에도 activeCardIndex 유지
  useEffect(() => {
    // 카드 탭으로 돌아올 때 activeCardIndex 강제 업데이트
    if (tab === 0) {
      const currentIndex = activeCardIndexRef.current;
      setActiveCardIndex(currentIndex);
    }
  }, [tab]);
  
  const [selectedPlace, setSelectedPlace] = useState<KakaoPlace | null>(null);
  const cards: UserCard[] = useMemo(() => getUserCards(), []);
  const [gifticons, setGifticons] = useState<Gifticon[]>([]);
  const bottomSheetRef = useRef<BottomSheetRef>(null);
  const [refreshing, setRefreshing] = useState(false);

  const userCardId = cards[activeCardIndex]?.userCardId ?? 0;
  const q = useCardBenefits(userCardId);
  
  // userCardId가 변경될 때 강제로 쿼리 무효화
  useEffect(() => {
    if (userCardId > 0) {
      // React Query 캐시 무효화는 자동으로 처리됨 (queryKey가 변경되므로)
    }
  }, [userCardId]);

  // 카드 혜택 정보
  const benefits = q.data?.benefits ?? [];
  const benefitNames = benefits.map((b) => b.franchiseName).filter(Boolean);



  // 주변 장소 검색 옵션을 안정화
  const nearbyPlacesOptions = useMemo(() => ({
    categoryCodes: SEARCH_CATEGORIES,
    radius: 1000, // 1km
    pages: 5, // 5페이지로 증가 (더 많은 가맹점)
    size: 15, // 카카오 API 최대 허용값
    sort: "distance" as const, // 거리순 정렬
    dedupe: true, // 중복 제거
    delayMsBetweenCalls: 100, // API 호출 간격
  }), []);

  // 주변 장소 검색 (카테고리 기반) - 거리순으로 정렬됨
  const {
    places: allNearbyPlaces,
    loading: nearbyLoading,
    error: nearbyError,
    isFetching: nearbyFetching,
    refetch: refetchNearbyPlaces,
    invalidateCache: invalidateNearbyCache,
  } = useNearbyPlacesQuery(KAKAO_KEY, [], nearbyPlacesOptions);

  // 디버깅을 위한 로그
  if (__DEV__) {
    console.log("🎯 PaymentScreen 상태:", {
      nearbyLoading,
      nearbyFetching,
      hasPlaces: allNearbyPlaces.length > 0,
      placesCount: allNearbyPlaces.length,
      error: nearbyError
    });
  }

  // 1단계: 가까운 가맹점들 (거리순으로 정렬하고 최대 10개로 제한)
  const nearbyPlaces = useMemo(() => {
    if (!allNearbyPlaces || allNearbyPlaces.length === 0) return [];
    
    // 거리순으로 정렬 (거리 정보가 없으면 이름순으로 정렬)
    const sortedPlaces = allNearbyPlaces.sort((a, b) => {
      const distanceA = a.distance ? parseFloat(a.distance) : Infinity;
      const distanceB = b.distance ? parseFloat(b.distance) : Infinity;
      
      // 거리가 같으면 이름순으로 정렬
      if (distanceA === distanceB) {
        return a.place_name.localeCompare(b.place_name);
      }
      
      return distanceA - distanceB;
    });
    
    // 최대 10개로 제한 (거리순 정렬 유지)
    const limitedPlaces = sortedPlaces.slice(0, 10);
    
    
    return limitedPlaces;
  }, [allNearbyPlaces]);

  // 2단계: 각 가맹점에 맞는 카드 혜택 찾기
  const placesWithBenefits = useMemo(() => {
    if (!nearbyPlaces || nearbyPlaces.length === 0 || !benefits || benefits.length === 0) return [];

    return nearbyPlaces.map((place) => {
      // 이 가맹점에 맞는 혜택들 찾기
      const matchingBenefits = benefits.filter((benefit) =>
        isPlaceMatchingBenefit(place.place_name, benefit.franchiseName)
      );

      return {
        place,
        benefits: matchingBenefits,
        benefitCount: matchingBenefits.length,
        totalDiscount: matchingBenefits.reduce((sum, b) => sum + (b.discountRate || 0), 0),
      };
    });
  }, [nearbyPlaces, benefits]);

  // 3단계: 모든 가맹점을 거리순으로 정렬 (혜택 유무 관계없이)
  const sortedPlacesWithBenefits = useMemo(() => {
    return placesWithBenefits
      .sort((a, b) => {
        // 거리순으로만 정렬 (가까운 순)
        const distanceA = parseFloat(a.place.distance || "0");
        const distanceB = parseFloat(b.place.distance || "0");
        return distanceA - distanceB;
      });
  }, [placesWithBenefits]);

  // 최종 가맹점 목록 (모든 가맹점, 거리순) - useMemo로 최적화
  const finalNearbyPlaces = useMemo(() => {
    return sortedPlacesWithBenefits.map((item) => item.place);
  }, [sortedPlacesWithBenefits]);


  const hasNearby = finalNearbyPlaces && finalNearbyPlaces.length > 0;
  
  // nearbyNames도 useMemo로 최적화
  const nearbyNames = useMemo(() => {
    return finalNearbyPlaces ? finalNearbyPlaces.map((p) => p.place_name) : [];
  }, [finalNearbyPlaces]);

  useEffect(() => {
    // API 대신 더미 세팅
    setGifticons(DUMMY_GIFTICONS); // Gifticon & {imageSource}?[] -> Gifticon[]으로 할당 OK
  }, []);
  // 주변 가맹점이 로드되면 첫 번째 가맹점을 자동으로 선택 (혜택이 가장 많은 가맹점)
  useEffect(() => {
    if (
      hasNearby &&
      !selectedPlace &&
      finalNearbyPlaces &&
      finalNearbyPlaces.length > 0
    ) {
      setSelectedPlace(finalNearbyPlaces[0]);
    }
  }, [hasNearby, selectedPlace, finalNearbyPlaces]);

  // 현재 선택된 가맹점의 혜택 찾기
  const matchedBenefits = useMemo(() => {
    if (!selectedPlace || !hasNearby) return [];

    // 선택된 가맹점에 맞는 혜택 찾기
    const placeWithBenefits = sortedPlacesWithBenefits.find(
      (item) => item.place.place_name === selectedPlace.place_name
    );

    return placeWithBenefits?.benefits || [];
  }, [selectedPlace, hasNearby, sortedPlacesWithBenefits]);

  // 기프티콘 필터링 - 현재 위치에 맞는 기프티콘만 표시
  const filteredGifticons = useMemo(() => {
    if (!hasNearby) return gifticons;

    const targetPlaces = selectedPlace
      ? [selectedPlace.place_name]
      : [nearbyNames[0]];

    return gifticons.filter((gifticon) => {
      const merchantName = gifticon.merchantName?.toLowerCase() ?? "";

      return targetPlaces.some((placeName) => {
        const place = placeName.toLowerCase();

        // 가맹점명이 장소명에 포함되거나, 장소명이 가맹점명에 포함되는 경우
        return place.includes(merchantName) || merchantName.includes(place);
      });
    });
  }, [gifticons, hasNearby, nearbyNames, selectedPlace]);

  // 카드 ID에 따른 혜택 정보 가져오기 (임시 구현)
  const getCardBenefitsForCard = useCallback((userCardId: number) => {
    // 실제로는 API에서 가져와야 하지만, 여기서는 간단히 하드코딩
    const mockBenefits = {
      101: [ // 국민 청춘카드
        { franchiseName: "스타벅스", discountRate: 25.0 },
        { franchiseName: "맘스터치", discountRate: 20.0 },
        { franchiseName: "세븐일레븐", discountRate: 10.0 },
      ],
      202: [ // 삼성 탭탭오
        { franchiseName: "이마트", discountRate: 15.0 },
        { franchiseName: "CGV", discountRate: 12.0 },
        { franchiseName: "세븐일레븐", discountRate: 8.0 },
      ],
      303: [ // 신한 Deep
        { franchiseName: "CGV", discountRate: 30.0 },
        { franchiseName: "스타벅스", discountRate: 15.0 },
        { franchiseName: "맘스터치", discountRate: 10.0 },
        { franchiseName: "GS25", discountRate: 12.0 },
      ],
    };
    
    return mockBenefits[userCardId as keyof typeof mockBenefits] || [];
  }, []);

  // 해당 장소에서 혜택이 가장 큰 카드 찾기
  const findBestCardForPlace = useCallback((place: KakaoPlace) => {
    let bestCardIndex = -1;
    let maxTotalDiscount = 0;
    
    cards.forEach((card, cardIndex) => {
      // 각 카드의 혜택 정보 가져오기
      const cardBenefits = getCardBenefitsForCard(card.userCardId);
      if (!cardBenefits || cardBenefits.length === 0) return;
      
      // 해당 장소와 매칭되는 혜택들 찾기
      const matchingBenefits = cardBenefits.filter(benefit => 
        isPlaceMatchingBenefit(place.place_name, benefit.franchiseName)
      );
      
      // 총 할인율 계산
      const totalDiscount = matchingBenefits.reduce((sum, benefit) => sum + benefit.discountRate, 0);
      
      // 가장 큰 혜택을 가진 카드 업데이트
      if (totalDiscount > maxTotalDiscount) {
        maxTotalDiscount = totalDiscount;
        bestCardIndex = cardIndex;
      }
    });
    
    
    return bestCardIndex;
  }, [cards, getCardBenefitsForCard]);

  // Pull-to-Refresh 핸들러
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // 캐시 무효화 후 새로 로드
      invalidateNearbyCache();
      await refetchNearbyPlaces();
    } catch (error) {
      console.error("새로고침 실패:", error);
    } finally {
      setRefreshing(false);
    }
  }, [invalidateNearbyCache, refetchNearbyPlaces]);

  // 위치 선택 핸들러 - 해당 장소에서 혜택이 가장 큰 카드로 자동 전환
  const handlePlaceSelect = (place: KakaoPlace) => {
    setSelectedPlace(place);
    bottomSheetRef.current?.close();
    
    // 해당 장소에서 혜택이 가장 큰 카드 찾기
    const bestCardForPlace = findBestCardForPlace(place);
    if (bestCardForPlace !== -1) {
      setActiveCardIndex(bestCardForPlace);
    }
  };

  // BottomSheet 열기 (카드 탭과 기프티콘 탭 모두에서 사용)
  const handleLocationChange = () => {
    bottomSheetRef.current?.snapToIndex(0);
  };

  // 템플릿 슬롯 조립
  const cardTopSection =
    tab === 0 && hasNearby ? (
      <View>
        <Text style={{ fontSize: 12, color: "#64748b" }}>현재 내 위치</Text>
        <Text
          style={{ fontSize: 16, fontWeight: "700", color: colors.BLUE_DARKER }}
        >
          {selectedPlace?.place_name ||
            (finalNearbyPlaces && finalNearbyPlaces[0]?.place_name) ||
            "주변 가맹점"}
        </Text>
        <TouchableOpacity onPress={handleLocationChange}>
          <Text style={{ color: "#94a3b8", marginTop: 4 }}>
            이 위치가 아닌가요?
          </Text>
        </TouchableOpacity>
      </View>
    ) : null;

  // 가맹점이 없을 때 카드 하단에 안내문구 추가
  const cardBottomSection =
    tab === 0 && !hasNearby ? (
      <View style={{ alignItems: "center", marginTop: 20 }}>
        <Text style={{ color: "#64748b", fontSize: 14, textAlign: "center" }}>
          휴대폰 뒷면을 카드 단말기에 대주세요
        </Text>
      </View>
    ) : null;

  // 기프티콘 탭의 위치 헤더
  const gifticonTopSection =
    tab === 1 && hasNearby ? (
      <View>
        <Text style={{ fontSize: 12, color: "#64748b" }}>현재 내 위치</Text>
        <Text
          style={{ fontSize: 16, fontWeight: "700", color: colors.BLUE_DARKER }}
        >
          {selectedPlace?.place_name ||
            (finalNearbyPlaces && finalNearbyPlaces[0]?.place_name) ||
            "주변 가맹점"}
        </Text>
        <TouchableOpacity onPress={handleLocationChange}>
          <Text style={{ color: "#94a3b8", marginTop: 4 }}>
            이 위치가 아닌가요?
          </Text>
        </TouchableOpacity>
      </View>
    ) : null;

  const benefitsSection =
    tab !== 0 ? null : q.isLoading ? (
      <LoadingCard />
    ) : q.error ? (
      <ErrorCard onRetry={() => q.refetch()} />
    ) : hasNearby && matchedBenefits.length > 0 ? (
      <View>
        {selectedPlace && (
          <View style={{ marginBottom: 8, paddingHorizontal: 16 }}>
            <Text style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
              {selectedPlace.place_name}에서 사용 가능한 혜택
            </Text>
          </View>
        )}
        <BenefitsList benefits={matchedBenefits} />
      </View>
    ) : null;

  return (
    <>
      <PaymentTemplate
        selectedTab={tab}
        onChangeTab={setTab}
        cards={cards}
        activeCardIndex={activeCardIndex}
        onActiveCardChange={handleActiveCardChange}
        cardTopSection={cardTopSection}
        cardBottomSection={cardBottomSection}
        benefitsSection={benefitsSection}
        // Gifticon 관련 props 추가
        gifticons={filteredGifticons}
        activeGifticonIndex={0}
        onActiveGifticonChange={(i, id) => {}}
        gifticonTopSection={gifticonTopSection}
        // Pull-to-Refresh 관련 props
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.BLUE_NORMAL]}
            tintColor={colors.BLUE_NORMAL}
          />
        }
      />

      {/* 로딩 인디케이터 - 첫 로딩일 때만 표시 */}
      {nearbyLoading && allNearbyPlaces.length === 0 && (
        <View style={{
          position: 'absolute',
          top: 100,
          left: 0,
          right: 0,
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <View style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 20,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
          }}>
            <ActivityIndicator size="small" color="white" />
            <Text style={{ color: 'white', fontSize: 14 }}>주변 가맹점을 찾는 중...</Text>
          </View>
        </View>
      )}

      {/* 주변 가맹점 BottomSheet - 모든 가맹점 표시 */}
      <NearbyPlacesBottomSheet
        ref={bottomSheetRef}
        places={nearbyPlaces || []}
        onPlaceSelect={handlePlaceSelect}
        isFetching={nearbyFetching}
      />
      
    </>
  );
}
