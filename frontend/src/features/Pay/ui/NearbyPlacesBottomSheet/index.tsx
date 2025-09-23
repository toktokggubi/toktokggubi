import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
  Image,
} from "react-native";
import {
  BottomSheetScrollView,
  BottomSheetFlatList,
} from "@gorhom/bottom-sheet";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppBottomSheet from "@/features/Auth/ui/BottomSheetList";
import type { BottomSheetRef } from "@/features/Auth/ui/BottomSheetList/types";
import { colors } from "@/shared/constants/colors";
import type { KakaoPlace } from "@/shared/types/location.types";
import { font } from "@/shared/typography/font";
import { KAKAO_CATEGORY_CODES } from "@/shared/constants/kakao";
import { CATEGORY_ICON_BY_NAME, CATEGORY_ICON_FALLBACK } from "@/shared/constants/categoryIcons";

import type { NearbyPlacesBottomSheetProps, PlaceWithBenefits } from "./types";

// 카테고리 정보를 가져오는 함수 (이름과 아이콘)
const getCategoryInfo = (place: KakaoPlace): { name: string; icon: any } => {
  // category_group_name이 있으면 우선 사용
  if (place.category_group_name) {
    const categoryMap: { [key: string]: { name: string; icon: any } } = {
      "카페": { name: "카페", icon: CATEGORY_ICON_BY_NAME["카페/간식"] },
      "음식점": { name: "음식점", icon: CATEGORY_ICON_BY_NAME["식비"] },
      "대형마트": { name: "대형마트", icon: CATEGORY_ICON_BY_NAME["쇼핑"] },
      "영화관": { name: "영화관", icon: CATEGORY_ICON_BY_NAME["문화"] },
      "편의점": { name: "편의점", icon: CATEGORY_ICON_BY_NAME["쇼핑"] },
      "주유소": { name: "주유소", icon: CATEGORY_ICON_BY_NAME["자동차"] },
      "숙박": { name: "숙박", icon: CATEGORY_ICON_BY_NAME["생활"] },
      "병원": { name: "병원", icon: CATEGORY_ICON_BY_NAME["의료/건강"] },
      "약국": { name: "약국", icon: CATEGORY_ICON_BY_NAME["의료/건강"] },
    };
    
    return categoryMap[place.category_group_name] || { name: place.category_group_name, icon: CATEGORY_ICON_FALLBACK };
  }
  
  // category_group_code로 매핑
  if (place.category_group_code) {
    const categoryMap: { [key: string]: { name: string; icon: any } } = {
      [KAKAO_CATEGORY_CODES.CAFE]: { name: "카페", icon: CATEGORY_ICON_BY_NAME["카페/간식"] },
      [KAKAO_CATEGORY_CODES.FOOD]: { name: "음식점", icon: CATEGORY_ICON_BY_NAME["식비"] },
      [KAKAO_CATEGORY_CODES.SUPERMARKET]: { name: "대형마트", icon: CATEGORY_ICON_BY_NAME["쇼핑"] },
      [KAKAO_CATEGORY_CODES.CINEMA]: { name: "영화관", icon: CATEGORY_ICON_BY_NAME["문화"] },
      [KAKAO_CATEGORY_CODES.CONVENIENCE]: { name: "편의점", icon: CATEGORY_ICON_BY_NAME["쇼핑"] },
      [KAKAO_CATEGORY_CODES.GAS_STATION]: { name: "주유소", icon: CATEGORY_ICON_BY_NAME["자동차"] },
      [KAKAO_CATEGORY_CODES.LODGING]: { name: "숙박", icon: CATEGORY_ICON_BY_NAME["생활"] },
      [KAKAO_CATEGORY_CODES.HOSPITAL]: { name: "병원", icon: CATEGORY_ICON_BY_NAME["의료/건강"] },
      [KAKAO_CATEGORY_CODES.PHARMACY]: { name: "약국", icon: CATEGORY_ICON_BY_NAME["의료/건강"] },
    };
    
    return categoryMap[place.category_group_code] || { name: "기타", icon: CATEGORY_ICON_FALLBACK };
  }
  
  return { name: "기타", icon: CATEGORY_ICON_FALLBACK };
};

const NearbyPlacesBottomSheet = React.forwardRef<
  BottomSheetRef,
  Omit<NearbyPlacesBottomSheetProps, "ref">
>(function NearbyPlacesBottomSheet({ places, onPlaceSelect, isFetching }, ref) {
  // const insets = useSafeAreaInsets();

  // 안드로이드 네비게이션 바 높이 (대략적)
  const bottomPadding = Platform.OS === "android" ? 60 : 20;

  // 거리 계산 함수 (Haversine 공식)
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371e3; // 지구 반지름 (미터)
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // 미터 단위
  };

  const renderPlaceItem = ({ item }: { item: PlaceWithBenefits }) => {
    const { place, benefits, gifticons } = item;
    let distance = "거리 정보 없음";

    if (place.distance) {
      distance = `${Math.round(parseFloat(place.distance))}m`;
    } else if (place.x && place.y) {
      // 수동으로 거리 계산 (현재 위치는 대전 유성구로 가정)
      const currentLat = 36.3552813;
      const currentLng = 127.29811;
      const placeLat = parseFloat(place.y);
      const placeLng = parseFloat(place.x);

      const calculatedDistance = calculateDistance(
        currentLat,
        currentLng,
        placeLat,
        placeLng
      );
      distance = `${Math.round(calculatedDistance)}m`;
    }

    const categoryInfo = getCategoryInfo(place);
    const hasBenefits = benefits && benefits.length > 0;
    const hasGifticons = gifticons && gifticons.length > 0;

    return (
      <TouchableOpacity
        style={styles.placeItem}
        onPress={() => onPlaceSelect(place)}
      >
        {/* 상단: 카테고리와 혜택/기프티콘 정보 */}
        <View style={styles.topRow}>
          <Text style={styles.categoryText}>{categoryInfo.name}</Text>
          
          <View style={styles.benefitSection}>
            {hasBenefits && hasGifticons ? (
              // 둘 다 있을 때: 나란히 표시
              <View style={styles.dualIconContainer}>
                <View style={styles.benefitBox}>
                  <Image 
                    source={require("@/assets/icon/card_icon.png")} 
                    style={styles.benefitIcon}
                  />
                </View>
                <View style={styles.gifticonBox}>
                  <Image 
                    source={require("@/assets/icon/gifticon_icon.png")} 
                    style={styles.gifticonIcon}
                  />
                </View>
              </View>
            ) : hasBenefits ? (
              // 카드만 있을 때
              <View style={styles.benefitBox}>
                <Image 
                  source={require("@/assets/icon/card_icon.png")} 
                  style={styles.benefitIcon}
                />
              </View>
            ) : hasGifticons ? (
              // 기프티콘만 있을 때
              <View style={styles.gifticonBox}>
                <Image 
                  source={require("@/assets/icon/gifticon_icon.png")} 
                  style={styles.gifticonIcon}
                />
              </View>
            ) : null}
          </View>
        </View>

        {/* 중간: 장소명과 거리 */}
        <View style={styles.middleRow}>
          <Text style={styles.placeName}>{place.place_name}</Text>
          <View style={styles.distanceBadge}>
            <Text style={styles.distanceText}>{distance}</Text>
          </View>
        </View>


        {/* 하단: 주소 */}
        <Text style={styles.placeAddress} numberOfLines={1}>
          {place.road_address_name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <AppBottomSheet
      ref={ref}
      snapPoints={["40%", "70%"]}
      initialIndex={-1}
      enablePanDownToClose={true}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>주변 가맹점</Text>
            <Text style={styles.subtitle}>1km 이내</Text>
          </View>
          {isFetching && (
            <View style={styles.refreshIndicator}>
              <ActivityIndicator size="small" color={colors.BLUE_NORMAL} />
              <Text style={styles.refreshText}>업데이트 중...</Text>
            </View>
          )}
        </View>

        <BottomSheetScrollView
          contentContainerStyle={[
            styles.listContainer,
            { paddingBottom: bottomPadding }, // 하단 여백 추가
          ]}
          style={styles.flatList}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
        >
          {places.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>주변에 가맹점이 없습니다</Text>
            </View>
          ) : (
            places.map((item, index) => (
              <View key={`${item.place.place_name}-${index}`}>
                {renderPlaceItem({ item })}
              </View>
            ))
          )}
        </BottomSheetScrollView>

        {/* 만약 BottomSheetScrollView가 안 되면 이걸로 시도 */}
        {/* 
        <ScrollView
          contentContainerStyle={[
            styles.listContainer,
            { paddingBottom: bottomPadding }
          ]}
          style={styles.flatList}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
        >
          {places.map((item, index) => (
            <View key={`${item.place_name}-${index}`}>
              {renderPlaceItem({ item })}
            </View>
          ))}
        </ScrollView>
        */}
      </View>
    </AppBottomSheet>
  );
});

export default NearbyPlacesBottomSheet;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  header: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerContent: {
    flex: 1,
  },
  refreshIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  refreshText: {
    fontSize: 12,
    color: colors.BLUE_NORMAL,
  },
  title: {
    fontSize: 18,
    ...font.bold,
    color: colors.BLUE_DARKER,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
  },
  flatList: {
    flex: 1, // 동적 크기로 변경
  },
  listContainer: {
    paddingVertical: 8,
  },
  placeItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    marginBottom: 6,
    minHeight: 70,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: -10,
  },
  categoryText: {
    fontSize: 11,
    ...font.medium,
    color: "#475569",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  placeAddress: {
    fontSize: 12,
    color: "#64748b",
    marginTop: -18,
    marginBottom: 10,
  },
  benefitSection: {
    flexDirection: "row",
    gap: 8,
  },
  dualIconContainer: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
  benefitBox: {
    width: 24,
    height: 24,
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  benefitIcon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
  gifticonBox: {
    width: 24,
    height: 24,
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  gifticonIcon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
  middleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  placeName: {
    fontSize: 15,
    ...font.bold,
    color: "#1e293b",
    flex: 1,
    
  },
  distanceBadge: {
    backgroundColor: colors.BLUE_DARKER,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 12,
  },
  distanceText: {
    fontSize: 11,
    ...font.medium,
    color: "white",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
  },
});
