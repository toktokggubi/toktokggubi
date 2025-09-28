import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import PaymentTemplate from "../templates/PaymentTemplate";
import { useUserCards } from "@/features/User/model/card/hooks";
import type { UserCardVM } from "@/features/User/model/card/types";

import { useCardBenefits } from "@/features/User/model/benefit/hooks";
import { useQuery } from "@tanstack/react-query";
import { fetchCardBenefits } from "@/features/User/api/wallet.fetchers";
import BenefitsList from "@/features/User/ui/BenefitsList";
import { useAuthGuard } from "@/shared/hooks/useAuthGuard";
import { useGifticonsQuery } from "@/features/User/model/gifticon/queries";
import { pushLocation } from "../api/fetchers";
import NotificationSettingsService from "@/shared/services/notificationSettingsService";

import { colors } from "@/shared/constants/colors";

import type { Gifticon as SharedGifticon } from "@/shared/types/gifticon";
import type { Gifticon as UserGifticon } from "@/features/User/model/gifticon/types";

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

// 카테고리 이름을 ID로 매핑하는 함수 (데이터베이스와 일치)
const getCategoryIdFromPlace = (place: KakaoPlace): number => {
  // 카카오 카테고리 그룹명을 우리 DB 카테고리 ID로 매핑
  if (place.category_group_name) {
    const categoryMap: { [key: string]: number } = {
      "카페": 2, // 카페/간식
      "음식점": 1, // 식비
      "대형마트": 5, // 쇼핑
      "영화관": 10, // 문화
      "편의점": 4, // 생활
      "주유소": 8, // 자동차
      "숙박": 4, // 생활
      "병원": 9, // 의료/건강
      "약국": 9, // 의료/건강
    };
    return categoryMap[place.category_group_name] || 1; // 기본값: 식비
  }
  
  // 카테고리 그룹 코드로 매핑
  if (place.category_group_code) {
    const categoryMap: { [key: string]: number } = {
      [KAKAO_CATEGORY_CODES.CAFE]: 2, // 카페/간식
      [KAKAO_CATEGORY_CODES.FOOD]: 1, // 식비
      [KAKAO_CATEGORY_CODES.SUPERMARKET]: 5, // 쇼핑
      [KAKAO_CATEGORY_CODES.CINEMA]: 10, // 문화
      [KAKAO_CATEGORY_CODES.CONVENIENCE]: 4, // 생활활
      [KAKAO_CATEGORY_CODES.GAS_STATION]: 8, // 자동차
      [KAKAO_CATEGORY_CODES.LODGING]: 4, // 생활
      [KAKAO_CATEGORY_CODES.HOSPITAL]: 9, // 의료/건강
      [KAKAO_CATEGORY_CODES.PHARMACY]: 9, // 의료/건강
    };
    return categoryMap[place.category_group_code] || 1; // 기본값: 식비
  }
  
  return 1; // 기본값: 식비
};

// UserGifticon을 SharedGifticon으로 변환하는 함수
const convertToSharedGifticon = (userGifticon: UserGifticon): SharedGifticon => {
  // 이미지 URL 정규화 (상대 경로인 경우 도메인 추가)
  const normalizeImageUrl = (imageKey: string): string => {
    if (!imageKey) return '';
    if (imageKey.startsWith('http')) return imageKey;
    return `https://j13b207.p.ssafy.io${imageKey}`;
  };

  return {
    gifticonId: userGifticon.gifticonId,
    label: userGifticon.label,
    merchantId: 0, // 임시값 (서버에서 제공하지 않음)
    merchantName: userGifticon.merchantName,
    categoryId: 0, // 임시값 (서버에서 제공하지 않음)
    categoryName: userGifticon.categoryName,
    imageUrl: normalizeImageUrl(userGifticon.imageKey), // imageKey를 정규화된 imageUrl로 매핑
    expiresAt: userGifticon.expiresAt,
    remainingDays: userGifticon.remainingDays,
    status: userGifticon.status,
    createdAt: userGifticon.createdAt || new Date().toISOString(),
  };
};

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
  공차: ["gongcha", "공차", "gong cha", "공차티라미수"],
  할리스: ["hollys", "할리스", "hollys coffee", "할리스커피"],
  이마트: ["emart", "이마트", "이마트몰"],
  CGV: ["cgv", "씨지브이"],
  맥도날드: ["mcdonald", "맥도날드", "맥도널드"],
  버거킹: ["burgerking", "버거킹"],
  맘스터치: ["momstouch", "맘스터치", "맘스터치치킨"],
  세븐일레븐: ["7eleven", "세븐일레븐", "7-eleven", "세븐", "7ELEVEN"],
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


export default function PaymentScreen() {
  const router = useRouter();
  // 인증 가드
  const { isAuthenticated, isLoading: authLoading } = useAuthGuard();
  
  const [tab, setTab] = useState(0);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const activeCardIndexRef = useRef(0);
  const [isUserManuallySwiped, setIsUserManuallySwiped] = useState(false);

  // activeCardIndex와 ref 동기화
  useEffect(() => {
    activeCardIndexRef.current = activeCardIndex;
  }, [activeCardIndex]);

  // activeCardIndex가 0으로 리셋되는 것을 방지
  const handleActiveCardChange = useCallback(
    (index: number, cardId: number) => {
      setActiveCardIndex(index);
      setIsUserManuallySwiped(true); // 사용자가 직접 슬라이드했음을 표시
    },
    []
  );

  // 탭 변경 시에도 activeCardIndex 유지
  useEffect(() => {
    // 카드 탭으로 돌아올 때 activeCardIndex 강제 업데이트
    if (tab === 0) {
      const currentIndex = activeCardIndexRef.current;
      setActiveCardIndex(currentIndex);
    }
  }, [tab]);

  const [selectedPlace, setSelectedPlace] = useState<KakaoPlace | null>(null);
  const { data: cards = [], isLoading: cardsLoading, isError: cardsError } = useUserCards();
  const { data: userGifticons = [], isLoading: gifticonsLoading, isError: gifticonsError } = useGifticonsQuery();
  const bottomSheetRef = useRef<BottomSheetRef>(null);
  const [refreshing, setRefreshing] = useState(false);
  const lastSentPlaceRef = useRef<string | null>(null);
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 컴포넌트 언마운트 시 디바운스 타이머 정리
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // 위치 정보를 서버로 전송하는 함수 (디바운스 적용)
  const sendLocationToServer = useCallback(async (place: KakaoPlace) => {
    // 이전 디바운스 타이머 취소
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // 500ms 디바운스 적용
    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        // 위치기반 알림 설정 확인
        const notificationService = NotificationSettingsService.getInstance();
        const isLocationNotificationEnabled = await notificationService.isNotificationEnabled('locationBasedOn');
        
        if (!isLocationNotificationEnabled) {
          return;
        }

        // 같은 장소로 중복 전송 방지
        const placeKey = `${place.place_name}-${place.x}-${place.y}`;
        if (lastSentPlaceRef.current === placeKey) {
          return;
        }

        const categoryId = getCategoryIdFromPlace(place);
        
        await pushLocation(categoryId);
        lastSentPlaceRef.current = placeKey;
      } catch (error) {
        // 에러가 발생해도 사용자 경험에 영향을 주지 않도록 조용히 처리
      }
    }, 500);
  }, []);

  // UserGifticon을 SharedGifticon으로 변환
  const gifticons: SharedGifticon[] = useMemo(() => {
    const converted = userGifticons.map(convertToSharedGifticon);
    return converted;
  }, [userGifticons]);

  const userCardId = cards[activeCardIndex]?.userCardId ?? 0;
  
  // 모든 카드의 혜택을 미리 가져오기
  const allCardBenefitsQuery = useQuery({
    queryKey: ['allCardBenefits', cards.map(card => card.userCardId)],
    queryFn: async () => {
      if (!cards || cards.length === 0) return [];
      
      const benefitsPromises = cards.map(card => 
        fetchCardBenefits(card.userCardId).catch(error => {
          return { benefits: [] };
        })
      );
      
      const allBenefits = await Promise.all(benefitsPromises);
      
      // 각 카드의 혜택을 카드 ID와 함께 저장
      const result = cards.map((card, index) => ({
        cardId: card.userCardId,
        cardName: card.cardName,
        cardIndex: index,
        benefits: allBenefits[index]?.benefits || []
      }));
      return result;
    },
    enabled: cards && cards.length > 0,
    staleTime: 5 * 60_000, // 5분간 캐시
  });

  // 현재 활성 카드의 혜택 (기존 로직 유지)
  const { data: cardBenefitsData, isLoading: benefitsLoading, isError: benefitsError } = useCardBenefits(userCardId);
  
  // 카드 혜택 정보를 간단한 형태로 변환
  const benefits = useMemo(() => {
    if (!cardBenefitsData?.benefits) {
      return [];
    }
    
    const mappedBenefits = cardBenefitsData.benefits.map(benefit => ({
      franchiseName: benefit.franchiseName,
      discountRate: benefit.discountRate,
    }));
    return mappedBenefits;
  }, [cardBenefitsData]);
  
  const benefitNames = benefits.map((b) => b.franchiseName).filter(Boolean);


  // 주변 장소 검색 옵션을 안정화
  const nearbyPlacesOptions = useMemo(
    () => ({
      categoryCodes: SEARCH_CATEGORIES,
      radius: 1000, // 1km
      pages: 5, // 5페이지로 증가 (더 많은 가맹점)
      size: 15, // 카카오 API 최대 허용값
      sort: "distance" as const, // 거리순 정렬
      dedupe: true, // 중복 제거
      delayMsBetweenCalls: 100, 
    }),
    []
  );

  // 주변 장소 검색 (카테고리 기반) - 거리순으로 정렬됨
  const {
    places: allNearbyPlaces,
    loading: nearbyLoading,
    error: nearbyError,
    isFetching: nearbyFetching,
    refetch: refetchNearbyPlaces,
    invalidateCache: invalidateNearbyCache,
  } = useNearbyPlacesQuery(KAKAO_KEY || "", [], nearbyPlacesOptions);


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



  // 혜택 정보가 포함된 가맹점 목록 (혜택 표시용)
  const placesWithBenefitsForDisplay = useMemo(() => {
    if (!nearbyPlaces || nearbyPlaces.length === 0 || !benefits || benefits.length === 0) {
      return [];
    }

    const result = nearbyPlaces.map((place) => {
      // 이 가맹점에 맞는 혜택들 찾기
      const matchingBenefits = benefits.filter((benefit) =>
        isPlaceMatchingBenefit(place.place_name, benefit.franchiseName)
      );

      return {
        place,
        benefits: matchingBenefits,
        benefitCount: matchingBenefits.length,
        totalDiscount: matchingBenefits.reduce(
          (sum, b) => sum + (b.discountRate || 0),
          0
        ),
      };
    });

    return result;
  }, [nearbyPlaces, benefits]);

  const hasNearby = nearbyPlaces && nearbyPlaces.length > 0;

  // nearbyNames도 useMemo로 최적화
  const nearbyNames = useMemo(() => {
    return nearbyPlaces ? nearbyPlaces.map((p) => p.place_name) : [];
  }, [nearbyPlaces]);

  // 주변 가맹점이 로드되면 첫 번째 가맹점을 자동으로 선택 (혜택이 가장 많은 가맹점)
  useEffect(() => {
    if (
      hasNearby &&
      !selectedPlace &&
      nearbyPlaces &&
      nearbyPlaces.length > 0
    ) {
      const firstPlace = nearbyPlaces[0];
      setSelectedPlace(firstPlace);
      
      // 첫 번째 장소의 카테고리 ID를 서버로 전송
      sendLocationToServer(firstPlace);
      
      // 모든 카드의 혜택 데이터가 로드되었으면 최적 카드로 전환
      if (!allCardBenefitsQuery.isLoading && allCardBenefitsQuery.data && allCardBenefitsQuery.data.length > 0) {
        let bestCardIndex = -1;
        let maxDiscountRate = 0;

        // 모든 카드의 혜택을 확인하여 가장 높은 할인율을 가진 카드 찾기
        for (const cardData of allCardBenefitsQuery.data) {
          const matchingBenefits = cardData.benefits.filter(benefit => 
            benefit.franchiseName && 
            isPlaceMatchingBenefit(firstPlace.place_name, benefit.franchiseName)
          );

          // 가장 높은 할인율 찾기
          for (const benefit of matchingBenefits) {
            if (benefit.discountRate > maxDiscountRate) {
              maxDiscountRate = benefit.discountRate;
              bestCardIndex = cardData.cardIndex;
            }
          }
        }

        if (bestCardIndex !== -1 && !isUserManuallySwiped) {
          setActiveCardIndex(bestCardIndex);
        }
      }
    }
  }, [hasNearby, selectedPlace, nearbyPlaces, allCardBenefitsQuery.isLoading, allCardBenefitsQuery.data, isUserManuallySwiped]);

  // 현재 선택된 가맹점의 혜택 찾기
  const matchedBenefits = useMemo(() => {
    if (!selectedPlace || !hasNearby) {
      return [];
    }

    // 선택된 가맹점에 맞는 혜택 찾기
    const placeWithBenefits = placesWithBenefitsForDisplay.find(
      (item) => item.place.place_name === selectedPlace.place_name
    );

    // BenefitsList가 기대하는 CardBenefit 형태로 변환
    const convertedBenefits = (placeWithBenefits?.benefits || []).map((benefit, index) => ({
      franchiseId: index + 1, // 임시 ID
      franchiseName: benefit.franchiseName,
      discountRate: benefit.discountRate,
      representativeCategory: {
        categoryId: 1, // 임시 카테고리 ID
        categoryName: "기타", // 임시 카테고리명
      },
    }));

    return convertedBenefits;
  }, [selectedPlace, hasNearby, placesWithBenefitsForDisplay]);

  // 기프티콘 필터링 - 현재 위치에 맞는 기프티콘만 표시
  const filteredGifticons = useMemo(() => {
    if (!hasNearby) return gifticons;

    const targetPlaces = selectedPlace
      ? [selectedPlace.place_name]
      : [nearbyNames[0]];


    const filtered = gifticons.filter((gifticon) => {
      const merchantName = gifticon.merchantName?.toLowerCase() ?? "";

      return targetPlaces.some((placeName) => {
        const place = placeName.toLowerCase();

        // 가맹점명이 장소명에 포함되거나, 장소명이 가맹점명에 포함되는 경우
        if (place.includes(merchantName) || merchantName.includes(place)) {
          return true;
        }

        // 브랜드별 매칭 규칙 적용
        for (const [brand, variations] of Object.entries(BRAND_MAPPINGS)) {
          const brandLower = brand.toLowerCase();
          
          // 기프티콘 가맹점명이 브랜드에 포함되거나, 브랜드가 가맹점명에 포함되는 경우
          if (merchantName.includes(brandLower) || brandLower.includes(merchantName)) {
            // 장소명이 해당 브랜드의 변형들 중 하나와 매칭되는지 확인
            const matchingVariation = variations.find((variation) => place.includes(variation.toLowerCase()));
            if (matchingVariation) {
              return true;
            }
          }
          
          // 기프티콘 가맹점명이 브랜드 변형들 중 하나와 매칭되는지도 확인
          const matchingMerchantVariation = variations.find((variation) => merchantName.includes(variation.toLowerCase()));
          if (matchingMerchantVariation) {
            // 장소명이 해당 브랜드의 변형들 중 하나와 매칭되는지 확인
            const matchingPlaceVariation = variations.find((variation) => place.includes(variation.toLowerCase()));
            if (matchingPlaceVariation) {
              return true;
            }
          }
        }

        return false;
      });
    });

    return filtered;
  }, [gifticons, hasNearby, nearbyNames, selectedPlace]);

  // 모든 장소에 대한 혜택과 기프티콘 매칭을 미리 계산
  const placesWithBenefitsAndGifticons = useMemo(() => {
    if (!nearbyPlaces || nearbyPlaces.length === 0) return [];

    return nearbyPlaces.map(place => {
      // 모든 카드의 혜택에서 해당 장소와 매칭되는 혜택 찾기
      let allMatchingBenefits: any[] = [];
      
      if (allCardBenefitsQuery.data) {
        for (const cardData of allCardBenefitsQuery.data) {
          const cardBenefits = cardData.benefits.filter(benefit => 
            benefit.franchiseName && 
            isPlaceMatchingBenefit(place.place_name, benefit.franchiseName)
          );
          allMatchingBenefits = [...allMatchingBenefits, ...cardBenefits];
        }
      }

      // 해당 장소의 기프티콘 찾기
      const matchedGifticons = gifticons.filter(gifticon => {
        const merchantName = gifticon.merchantName?.toLowerCase() ?? "";
        const placeName = place.place_name.toLowerCase();
        
        // 가맹점명이 장소명에 포함되거나, 장소명이 가맹점명에 포함되는 경우
        if (placeName.includes(merchantName) || merchantName.includes(placeName)) {
          return true;
        }

        // 브랜드별 매칭 규칙 적용
        for (const [brand, variations] of Object.entries(BRAND_MAPPINGS)) {
          const brandLower = brand.toLowerCase();
          
          // 기프티콘 가맹점명이 브랜드에 포함되거나, 브랜드가 가맹점명에 포함되는 경우
          if (merchantName.includes(brandLower) || brandLower.includes(merchantName)) {
            // 장소명이 해당 브랜드의 변형들 중 하나와 매칭되는지 확인
            const matchingVariation = variations.find((variation) => placeName.includes(variation.toLowerCase()));
            if (matchingVariation) {
              return true;
            }
          }
          
          // 기프티콘 가맹점명이 브랜드 변형들 중 하나와 매칭되는지도 확인
          const matchingMerchantVariation = variations.find((variation) => merchantName.includes(variation.toLowerCase()));
          if (matchingMerchantVariation) {
            // 장소명이 해당 브랜드의 변형들 중 하나와 매칭되는지 확인
            const matchingPlaceVariation = variations.find((variation) => placeName.includes(variation.toLowerCase()));
            if (matchingPlaceVariation) {
              return true;
            }
          }
        }

        return false;
      });

      // 현재 장소의 최고 혜택률 찾기
      const currentPlaceMaxDiscount = allMatchingBenefits.length > 0 
        ? Math.max(...allMatchingBenefits.map(b => b.discountRate || 0))
        : 0;

      // 같은 카테고리에서 더 높은 혜택률을 가진 다른 가게 찾기
      let betterBenefitInfo = null;
      if (allCardBenefitsQuery.data) {
        // 현재 장소의 카테고리 정보 가져오기
        const getCategoryFromPlace = (place: KakaoPlace): string => {
          if (place.category_group_name) {
            const categoryMap: { [key: string]: string } = {
              "카페": "카페",
              "음식점": "음식점", 
              "대형마트": "대형마트",
              "영화관": "영화관",
              "편의점": "편의점",
              "주유소": "주유소",
              "숙박": "숙박",
              "병원": "병원",
              "약국": "약국",
            };
            return categoryMap[place.category_group_name] || "기타";
          }
          
          if (place.category_group_code) {
            const categoryMap: { [key: string]: string } = {
              [KAKAO_CATEGORY_CODES.CAFE]: "카페",
              [KAKAO_CATEGORY_CODES.FOOD]: "음식점",
              [KAKAO_CATEGORY_CODES.SUPERMARKET]: "대형마트",
              [KAKAO_CATEGORY_CODES.CINEMA]: "영화관",
              [KAKAO_CATEGORY_CODES.CONVENIENCE]: "편의점",
              [KAKAO_CATEGORY_CODES.GAS_STATION]: "주유소",
              [KAKAO_CATEGORY_CODES.LODGING]: "숙박",
              [KAKAO_CATEGORY_CODES.HOSPITAL]: "병원",
              [KAKAO_CATEGORY_CODES.PHARMACY]: "약국",
            };
            return categoryMap[place.category_group_code] || "기타";
          }
          
          return "기타";
        };

        const currentCategory = getCategoryFromPlace(place);
        
        // 같은 카테고리의 다른 장소들 중에서 더 높은 혜택률을 가진 곳 찾기
        for (const otherPlace of nearbyPlaces) {
          if (otherPlace.place_name === place.place_name) continue;
          
          const otherCategory = getCategoryFromPlace(otherPlace);
          
          if (otherCategory !== currentCategory) {
            continue;
          }
          
          // 다른 장소의 혜택 찾기
          let otherPlaceBenefits: any[] = [];
          if (allCardBenefitsQuery.data) {
            for (const cardData of allCardBenefitsQuery.data) {
              const cardBenefits = cardData.benefits.filter(benefit => 
                benefit.franchiseName && 
                isPlaceMatchingBenefit(otherPlace.place_name, benefit.franchiseName)
              );
              otherPlaceBenefits = [...otherPlaceBenefits, ...cardBenefits];
            }
          }
          
          const otherPlaceMaxDiscount = otherPlaceBenefits.length > 0 
            ? Math.max(...otherPlaceBenefits.map(b => b.discountRate || 0))
            : 0;
          
          if (otherPlaceMaxDiscount > currentPlaceMaxDiscount) {
            betterBenefitInfo = {
              placeName: otherPlace.place_name,
              discountRate: otherPlaceMaxDiscount,
              currentDiscountRate: currentPlaceMaxDiscount,
            };
            break; // 첫 번째로 찾은 더 나은 혜택만 표시
          } else if (currentPlaceMaxDiscount === 0 && otherPlaceMaxDiscount > 0) {
            betterBenefitInfo = {
              placeName: otherPlace.place_name,
              discountRate: otherPlaceMaxDiscount,
              currentDiscountRate: currentPlaceMaxDiscount,
            };
            break; // 첫 번째로 찾은 더 나은 혜택만 표시
          }
        }
      }

      return {
        place,
        benefits: allMatchingBenefits,
        gifticons: matchedGifticons,
        betterBenefitInfo,
      };
    });
  }, [nearbyPlaces, allCardBenefitsQuery.data, gifticons]);

  // 현재 선택된 장소에 대한 더 나은 혜택 정보 찾기
  const currentPlaceBetterBenefit = useMemo(() => {
    if (!selectedPlace || !hasNearby) {
      return null;
    }

    // 현재 선택된 장소의 정보 찾기
    const currentPlaceData = placesWithBenefitsAndGifticons.find(
      (item) => item.place.place_name === selectedPlace.place_name
    );

    return currentPlaceData?.betterBenefitInfo || null;
  }, [selectedPlace, hasNearby, placesWithBenefitsAndGifticons]);

  // 해당 장소에서 혜택이 가장 큰 카드 찾기
  const findBestCardForPlace = useCallback(
    (place: KakaoPlace) => {
      if (!allCardBenefitsQuery.data || allCardBenefitsQuery.data.length === 0) {
        return -1;
      }

      let bestCardIndex = -1;
      let maxDiscountRate = 0;

      // 모든 카드의 혜택을 확인하여 가장 높은 할인율을 가진 카드 찾기
      for (const cardData of allCardBenefitsQuery.data) {
        // 해당 장소와 매칭되는 혜택 찾기
        const matchingBenefits = cardData.benefits.filter(benefit => 
          benefit.franchiseName && 
          isPlaceMatchingBenefit(place.place_name, benefit.franchiseName)
        );

        // 가장 높은 할인율 찾기
        for (const benefit of matchingBenefits) {
          if (benefit.discountRate > maxDiscountRate) {
            maxDiscountRate = benefit.discountRate;
            bestCardIndex = cardData.cardIndex;
          }
        }
      }

      return bestCardIndex;
    },
    [allCardBenefitsQuery.data]
  );

  // 카드 혜택 데이터가 로드된 후 현재 선택된 장소에 맞는 최적 카드로 전환
  useEffect(() => {
    if (
      selectedPlace && 
      !allCardBenefitsQuery.isLoading && 
      allCardBenefitsQuery.data &&
      allCardBenefitsQuery.data.length > 0
    ) {
      const bestCardIndex = findBestCardForPlace(selectedPlace);
      if (bestCardIndex !== -1 && bestCardIndex !== activeCardIndex && !isUserManuallySwiped) {
        setActiveCardIndex(bestCardIndex);
      }
    }
  }, [allCardBenefitsQuery.isLoading, allCardBenefitsQuery.data, selectedPlace, findBestCardForPlace, activeCardIndex, isUserManuallySwiped]);

  // Pull-to-Refresh 핸들러
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // 캐시 무효화 후 새로 로드
      invalidateNearbyCache();
      await refetchNearbyPlaces();
      
      // 현재 선택된 장소가 있으면 카테고리 ID를 다시 전송
      if (selectedPlace) {
        sendLocationToServer(selectedPlace);
      }
    } catch (error) {
    } finally {
      setRefreshing(false);
    }
  }, [invalidateNearbyCache, refetchNearbyPlaces, selectedPlace]);

  // 위치 선택 핸들러 - 해당 장소에서 혜택이 가장 큰 카드로 자동 전환
  const handlePlaceSelect = (place: KakaoPlace) => {
    setSelectedPlace(place);
    bottomSheetRef.current?.close();
    setIsUserManuallySwiped(false); // 장소 선택 시 수동 슬라이드 상태 리셋

    // 선택된 장소의 카테고리 ID를 서버로 전송
    sendLocationToServer(place);

    // 모든 카드의 혜택 데이터가 로드되지 않았으면 현재 카드 유지
    if (allCardBenefitsQuery.isLoading || !allCardBenefitsQuery.data) {
      return;
    }

    // 해당 장소에서 혜택이 가장 큰 카드 찾기
    const bestCardIndex = findBestCardForPlace(place);
    
    if (bestCardIndex !== -1) {
      setActiveCardIndex(bestCardIndex);
    }
  };

  // BottomSheet 열기 (카드 탭과 기프티콘 탭 모두에서 사용)
  const handleLocationChange = () => {
    bottomSheetRef.current?.snapToIndex(0);
  };

  // 템플릿 슬롯 조립
  const cardTopSection =
    tab === 0 ? (
      <View style={{ position: "relative" }}>
        {hasNearby ? (
          <>
            <Text style={{ fontSize: 12, color: "#64748b" }}>현재 내 위치</Text>
            <Text
              style={{ fontSize: 16, fontWeight: "700", color: colors.BLUE_DARKER }}
            >
              {selectedPlace?.place_name ||
                (nearbyPlaces && nearbyPlaces[0]?.place_name) ||
                "주변 가맹점"}
            </Text>
            <TouchableOpacity onPress={handleLocationChange}>
              <Text style={{ color: "#94a3b8", marginTop: 4 }}>
                이 위치가 아닌가요?
              </Text>
            </TouchableOpacity>
            
            {/* 더 나은 혜택 안내 메시지 - 캐릭터와 말풍선 */}
            {currentPlaceBetterBenefit && (
              <View style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginTop: 8,
              }}>
                {/* 캐릭터 이미지 */}
                <Image 
                  source={require("@/assets/images/character/stupid.png")}
                  style={{
                    width: 50,
                    height: 50,
                    resizeMode: "contain",
                  }}
                />
                {/* 동그란 말풍선 - 터치 가능 */}
                <TouchableOpacity 
                  style={{
                    backgroundColor: colors.BLUE_LIGHT,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: colors.BLUE_NORMAL,
                    alignSelf: "flex-start",
                    marginTop: 8,
                  }}
                  onPress={() => {
                    // 더 나은 혜택을 가진 가맹점 찾기
                    const betterPlace = nearbyPlaces.find(place => 
                      place.place_name === currentPlaceBetterBenefit.placeName
                    );
                    if (betterPlace) {
                      handlePlaceSelect(betterPlace);
                    }
                  }}
                >
                  <Text style={{
                    fontSize: 12,
                    color: colors.BLUE_DARKER,
                    fontWeight: "400",
                    lineHeight: 16,
                  }}>
                    <Text style={{ fontWeight: "700", color: colors.BLUE_NORMAL }}>
                      {currentPlaceBetterBenefit.placeName}
                    </Text>
                    에서{" "}
                    {currentPlaceBetterBenefit.currentDiscountRate > 0 ? (
                      <>
                        <Text style={{ fontWeight: "700", color: colors.BLUE_NORMAL }}>
                          {currentPlaceBetterBenefit.discountRate - currentPlaceBetterBenefit.currentDiscountRate}%
                        </Text>
                        {" "}더 많은 혜택!
                      </>
                    ) : (
                      <>
                        <Text style={{ fontWeight: "700", color: colors.BLUE_NORMAL }}>
                          {currentPlaceBetterBenefit.discountRate}%
                        </Text>
                        {" "}혜택 받기!
                      </>
                    )}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <View style={{ alignItems: "center", marginTop: 20 }}>
            <Text style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>현재 내 위치</Text>
            <Text style={{ fontSize: 16, fontWeight: "700", color: colors.BLUE_DARKER, marginBottom: 8 }}>
              위치 정보를 불러오는 중...
            </Text>
            <Text style={{ color: "#94a3b8", fontSize: 14, textAlign: "center" }}>
              잠시만 기다려주세요
            </Text>
          </View>
        )}
      </View>
    ) : null;

  // 카드 하단에 안내문구 추가 (혜택이 없을 때만)
  const cardBottomSection = 
    tab === 0 && hasNearby && matchedBenefits.length === 0 ? (
      <View style={{ alignItems: "center", marginTop: 8 }}>
        <Text style={{ color: "#64748b", fontSize: 14, textAlign: "center" }}>
          카드를 누르면 QR 결제를 할 수 있습니다
        </Text>
      </View>
    ) : null;

  // 기프티콘 탭의 위치 헤더
  const gifticonTopSection =
    tab === 1 ? (
      <View>
        {hasNearby ? (
          <>
            <Text style={{ fontSize: 12, color: "#64748b" }}>현재 내 위치</Text>
            <Text
              style={{ fontSize: 16, fontWeight: "700", color: colors.BLUE_DARKER }}
            >
              {selectedPlace?.place_name ||
                (nearbyPlaces && nearbyPlaces[0]?.place_name) ||
                "주변 가맹점"}
            </Text>
            <TouchableOpacity onPress={handleLocationChange}>
              <Text style={{ color: "#94a3b8", marginTop: 4 }}>
                이 위치가 아닌가요?
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={{ alignItems: "center", marginTop: 20 }}>
            <Text style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>현재 내 위치</Text>
            <Text style={{ fontSize: 16, fontWeight: "700", color: colors.BLUE_DARKER, marginBottom: 8 }}>
              위치 정보를 불러오는 중...
            </Text>
            <Text style={{ color: "#94a3b8", fontSize: 14, textAlign: "center" }}>
              잠시만 기다려주세요
            </Text>
          </View>
        )}
      </View>
    ) : null;

  const benefitsSection =
    tab !== 0 ? null : hasNearby && matchedBenefits.length > 0 ? (
      <View>
        {/* 카드 터치 안내 문구 */}
        <View style={{ alignItems: "center", marginBottom: 12 }}>
          <Text style={{ color: "#64748b", fontSize: 14, textAlign: "center" }}>
            카드를 누르면 QR 결제를 할 수 있습니다
          </Text>
        </View>
        
        {selectedPlace && (
          <View style={{ marginBottom: 4, paddingHorizontal: 16 }}>
            <Text style={{ fontSize: 12, color: "#64748b", marginBottom: 2 }}>
              {selectedPlace.place_name}에서 사용 가능한 혜택
            </Text>
          </View>
        )}
        <BenefitsList benefits={matchedBenefits} />
      </View>
    ) : null;

  // 인증 로딩 중이거나 인증되지 않은 경우
  if (authLoading || !isAuthenticated) {
    return null; // useAuthGuard에서 자동으로 리다이렉트됨
  }

  // 카드 또는 기프티콘 로딩 중인 경우
  if (cardsLoading || gifticonsLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.BLUE_NORMAL} />
        <Text style={{ marginTop: 16, color: colors.GRAY_DARK }}>
          {cardsLoading ? "카드 정보를 불러오는 중..." : "기프티콘 정보를 불러오는 중..."}
        </Text>
      </View>
    );
  }

  // 카드가 없는 경우 - 화면은 표시하되 카드 관련 기능만 비활성화
  const hasCards = !cardsError && cards.length > 0;

  // 기프티콘 에러가 있는 경우 (카드는 있지만 기프티콘만 에러)
  if (gifticonsError) {
    // 기프티콘 로딩 실패 시 조용히 처리
  }

  return (
    <>
      <PaymentTemplate
        selectedTab={tab}
        onChangeTab={setTab}
        cards={hasCards ? (cards as UserCardVM[]) : []}
        activeCardIndex={hasCards ? activeCardIndex : 0}
        onActiveCardChange={hasCards ? handleActiveCardChange : () => {}}
        cardTopSection={hasCards ? cardTopSection : (
          <View style={{ position: "relative" }}>
            {/* 위치 정보 - 카드가 없을 때도 표시 */}
            {hasNearby ? (
              <>
                <Text style={{ fontSize: 12, color: "#64748b" }}>현재 내 위치</Text>
                <Text
                  style={{ fontSize: 16, fontWeight: "700", color: colors.BLUE_DARKER }}
                >
                  {selectedPlace?.place_name ||
                    (nearbyPlaces && nearbyPlaces[0]?.place_name) ||
                    "주변 가맹점"}
                </Text>
                <TouchableOpacity onPress={handleLocationChange}>
                  <Text style={{ color: "#94a3b8", marginTop: 4 }}>
                    이 위치가 아닌가요?
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={{ alignItems: "center", marginTop: 20 }}>
                <Text style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>현재 내 위치</Text>
                <Text style={{ fontSize: 16, fontWeight: "700", color: colors.BLUE_DARKER, marginBottom: 8 }}>
                  위치 정보를 불러오는 중...
                </Text>
                <Text style={{ color: "#94a3b8", fontSize: 14, textAlign: "center" }}>
                  잠시만 기다려주세요
                </Text>
              </View>
            )}
            
            {/* 카드가 없을 때의 UI */}
            <View style={{ alignItems: "center", marginTop: 88 }}>
              {/* 캐릭터 이미지 */}
              <Image 
                source={require("@/assets/images/character/big-character-06.png")}
                style={{
                  width: 120,
                  height: 120,
                  resizeMode: "contain",
                  marginBottom: 16,
                }}
              />
              {/* 안내 메시지 */}
              <Text style={{ color: colors.GRAY_DARK, fontSize: 18, fontWeight: "600", marginBottom: 8 }}>
                아직 등록된 카드가 없어요
              </Text>
              <Text style={{ color: "#64748b", fontSize: 14, textAlign: "center", marginBottom: 20 }}>
                카드를 등록하면 결제할 수 있습니다
              </Text>
              {/* 카드 관리 버튼 */}
              <TouchableOpacity 
                style={{
                  backgroundColor: colors.BLUE_NORMAL,
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 8,
                }}
                  onPress={() => {
                    // 네비게이션 스택을 리셋하고 카드 관리 페이지로 이동
                    router.replace("/cards");
                  }}
              >
                <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
                  카드 관리
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        cardBottomSection={cardBottomSection}
        benefitsSection={hasCards ? benefitsSection : null}
        // Gifticon 관련 props 추가
        gifticons={filteredGifticons as SharedGifticon[]}
        activeGifticonIndex={0}
        onActiveGifticonChange={(i, id) => {}}
        gifticonTopSection={gifticonTopSection}
        gifticonBottomSection={(() => {
          const activeGifticons = gifticons.filter(gifticon => gifticon.status === "ACTIVE");
          const activeFilteredGifticons = filteredGifticons.filter(gifticon => gifticon.status === "ACTIVE");
          
          
          // 전체 기프티콘이 없거나, 현재 위치에서 사용 가능한 기프티콘이 없을 때
          if (activeGifticons.length === 0 || activeFilteredGifticons.length === 0) {
            return (
              <View style={{ alignItems: "center", marginTop: 80 }}>
                {/* 캐릭터 이미지 */}
                <Image 
                  source={require("@/assets/images/character/big-character-06.png")}
                  style={{
                    width: 120,
                    height: 120,
                    resizeMode: "contain",
                    marginBottom: 16,
                  }}
                />
                {/* 안내 메시지 */}
                <Text style={{ color: colors.GRAY_DARK, fontSize: 18, fontWeight: "600", marginBottom: 8 }}>
                  {activeGifticons.length === 0 
                    ? "사용 가능한 기프티콘이 없어요" 
                    : "현재 위치에서 사용 가능한 기프티콘이 없어요"}
                </Text>
                <Text style={{ color: "#64748b", fontSize: 14, textAlign: "center", marginBottom: 20 }}>
                  {activeGifticons.length === 0 
                    ? "기프티콘을 등록하면 사용할 수 있습니다" 
                    : "기프티콘을 등록해보세요"}
                </Text>
                {/* 기프티콘 관리 버튼 */}
                <TouchableOpacity 
                  style={{
                    backgroundColor: colors.BLUE_NORMAL,
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    borderRadius: 8,
                  }}
                  onPress={() => {
                    // 네비게이션 스택을 리셋하고 기프티콘 관리 페이지로 이동
                    router.replace("/gifticons");
                  }}
                >
                  <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
                    기프티콘 관리
                  </Text>
                </TouchableOpacity>
              </View>
            );
          }
          return null;
        })()}
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
        <View
          style={{
            position: "absolute",
            top: 100,
            left: 0,
            right: 0,
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <View
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 20,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <ActivityIndicator size="small" color="white" />
            <Text style={{ color: "white", fontSize: 14 }}>
              주변 가맹점을 찾는 중...
            </Text>
          </View>
        </View>
      )}

      {/* 주변 가맹점 BottomSheet - 모든 가맹점 표시 */}
      <NearbyPlacesBottomSheet
        ref={bottomSheetRef}
        places={placesWithBenefitsAndGifticons.map(({ place, benefits: placeBenefits, gifticons: placeGifticons }) => {
          return {
            place,
            benefits: placeBenefits.map((benefit, index) => ({
              franchiseId: index + 1,
              franchiseName: benefit.franchiseName,
              discountRate: benefit.discountRate,
              representativeCategory: {
                categoryId: 1,
                categoryName: "기타",
              },
            })),
            gifticons: placeGifticons as SharedGifticon[],
          };
        })}
        onPlaceSelect={handlePlaceSelect}
        isFetching={nearbyFetching}
      />
    </>
  );
}
