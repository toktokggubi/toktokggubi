import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, ActivityIndicator } from "react-native";
import { BottomSheetScrollView, BottomSheetFlatList } from "@gorhom/bottom-sheet";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppBottomSheet from "@/features/Auth/ui/BottomSheetList";
import type { BottomSheetRef } from "@/features/Auth/ui/BottomSheetList/types";
import type { KakaoPlace } from "@/shared/types/location.types";
import { colors } from "@/shared/constants/colors";
import type { NearbyPlacesBottomSheetProps } from "./types";

const NearbyPlacesBottomSheet = React.forwardRef<
  BottomSheetRef,
  Omit<NearbyPlacesBottomSheetProps, "ref">
>(function NearbyPlacesBottomSheet({ places, onPlaceSelect, isFetching }, ref) {
  // const insets = useSafeAreaInsets();
  
  // 안드로이드 네비게이션 바 높이 (대략적)
  const bottomPadding = Platform.OS === 'android' ? 60 : 20;
  
  // 거리 계산 함수 (Haversine 공식)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // 지구 반지름 (미터)
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // 미터 단위
  };

  const renderPlaceItem = ({ item }: { item: KakaoPlace }) => {
    let distance = "거리 정보 없음";
    
    if (item.distance) {
      distance = `${Math.round(parseFloat(item.distance))}m`;
    } else if (item.x && item.y) {
      // 수동으로 거리 계산 (현재 위치는 대전 유성구로 가정)
      const currentLat = 36.3552813;
      const currentLng = 127.29811;
      const placeLat = parseFloat(item.y);
      const placeLng = parseFloat(item.x);
      
      const calculatedDistance = calculateDistance(currentLat, currentLng, placeLat, placeLng);
      distance = `${Math.round(calculatedDistance)}m`;
    }
    
    return (
      <TouchableOpacity
        style={styles.placeItem}
        onPress={() => onPlaceSelect(item)}
      >
        <View style={styles.placeInfo}>
          <Text style={styles.placeName}>{item.place_name}</Text>
          <Text style={styles.placeAddress}>{item.road_address_name}</Text>
        </View>
        <View style={styles.distanceBadge}>
          <Text style={styles.distanceText}>{distance}</Text>
        </View>
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
            { paddingBottom: bottomPadding } // 하단 여백 추가
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
        </BottomSheetScrollView>
        
        {/* 만약 BottomSheetScrollView가 안 되면 이걸로 시도해보세요 */}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  refreshIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  refreshText: {
    fontSize: 12,
    color: colors.BLUE_NORMAL,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    marginBottom: 8,
  },
  placeInfo: {
    flex: 1,
    marginRight: 12,
  },
  placeName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  placeAddress: {
    fontSize: 14,
    color: "#64748b",
  },
  distanceBadge: {
    backgroundColor: colors.BLUE_DARKER,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
});
