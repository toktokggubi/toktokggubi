import React, { useEffect, useMemo, useState, useRef } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import PaymentTemplate from "../templates/PaymentTemplate";
import { getUserCards } from "@/features/User/api/cardService";
import type { UserCard } from "@/features/User/screens/MyPageScreen/types";

import { useCardBenefits } from "@/features/User/model/benefit/hooks";
import BenefitsList from "@/features/User/ui/BenefitsList";

import { colors } from "@/shared/constants/colors";

import { DUMMY_GIFTICONS } from "@/features/Pay/model/dummyGifticons";
import type { Gifticon } from "@/shared/types/gifticon";

// real과 mock 교체 - useNearbyPlaces.ts 파일에서 export 부분만 바꾸면 됩니다
import { useNearbyPlaces } from "@/shared/hooks/useNearbyPlaces";
import NearbyPlacesBottomSheet from "../ui/NearbyPlacesBottomSheet";
import type { BottomSheetRef } from "@/features/Auth/ui/BottomSheetList/types";
import type { KakaoPlace } from "@/shared/types/location.types";

const KAKAO_KEY = process.env.EXPO_PUBLIC_KAKAO_REST_KEY!;

// (예시) 프로젝트의 로딩/에러 컴포넌트로 교체 가능
const LoadingCard = () => null;
const ErrorCard = ({ onRetry }: { onRetry: () => void }) => null;

export default function PaymentScreen() {
  const [tab, setTab] = useState(0);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [selectedPlace, setSelectedPlace] = useState<KakaoPlace | null>(null);
  const cards: UserCard[] = getUserCards();
  const [gifticons, setGifticons] = useState<Gifticon[]>([]);
  const bottomSheetRef = useRef<BottomSheetRef>(null);

  const userCardId = cards[activeCardIndex]?.userCardId ?? 0;
  const q = useCardBenefits(userCardId);

  const keywords =
    q.data?.benefits?.map((b) => b.franchiseName).filter(Boolean) ?? [];
  const nearbyPlaces = useNearbyPlaces(KAKAO_KEY, keywords) ?? [];

  const hasNearby = nearbyPlaces.length > 0;
  const nearbyNames = nearbyPlaces.map((p) => p.place_name);

  useEffect(() => {
    // API 대신 더미 세팅
    setGifticons(DUMMY_GIFTICONS); // Gifticon & {imageSource}?[] -> Gifticon[]으로 할당 OK
  }, []);
  // 주변 가맹점이 로드되면 첫 번째 가맹점을 자동으로 선택
  useEffect(() => {
    if (hasNearby && !selectedPlace) {
      setSelectedPlace(nearbyPlaces[0]);
    }
  }, [hasNearby, selectedPlace, nearbyPlaces]);

  // 혜택 매칭
  const matchedBenefits = useMemo(() => {
    if (!q.data?.benefits || !hasNearby) return [];

    const targetPlaces = selectedPlace
      ? [selectedPlace.place_name]
      : [nearbyNames[0]];

    const filtered = q.data.benefits.filter((b) => {
      const franchiseName = b.franchiseName?.toLowerCase?.() ?? "";

      return targetPlaces.some((placeName) => {
        const place = placeName.toLowerCase();

        return place.includes(franchiseName) || franchiseName.includes(place);
      });
    });

    return filtered;
  }, [q.data?.benefits, hasNearby, nearbyNames, selectedPlace]);

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

  // 위치 선택 핸들러
  const handlePlaceSelect = (place: KakaoPlace) => {
    setSelectedPlace(place);
    bottomSheetRef.current?.close();
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
            nearbyPlaces[0]?.place_name ||
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
            nearbyPlaces[0]?.place_name ||
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
        onActiveCardChange={setActiveCardIndex}
        cardTopSection={cardTopSection}
        cardBottomSection={cardBottomSection}
        benefitsSection={benefitsSection}
        // Gifticon 관련 props 추가
        gifticons={filteredGifticons}
        activeGifticonIndex={0}
        onActiveGifticonChange={(i, id) => {}}
        gifticonTopSection={gifticonTopSection}
      />

      {/* 주변 가맹점 BottomSheet */}
      <NearbyPlacesBottomSheet
        ref={bottomSheetRef}
        places={nearbyPlaces}
        onPlaceSelect={handlePlaceSelect}
      />
    </>
  );
}
