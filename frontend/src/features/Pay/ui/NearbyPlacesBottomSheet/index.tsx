import AppBottomSheet from "@/features/Auth/ui/BottomSheetList";
import type { BottomSheetRef } from "@/features/Auth/ui/BottomSheetList/types";
import { colors } from "@/shared/constants/colors";
import type { KakaoPlace } from "@/shared/types/location.types";
import { font } from "@/shared/typography/font";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { NearbyPlacesBottomSheetProps } from "./types";

const NearbyPlacesBottomSheet = React.forwardRef<
  BottomSheetRef,
  Omit<NearbyPlacesBottomSheetProps, "ref">
>(function NearbyPlacesBottomSheet({ places, onPlaceSelect }, ref) {
  const renderPlaceItem = ({ item }: { item: KakaoPlace }) => (
    <TouchableOpacity
      style={styles.placeItem}
      onPress={() => onPlaceSelect(item)}
    >
      <View style={styles.placeInfo}>
        <Text style={styles.placeName}>{item.place_name}</Text>
        <Text style={styles.placeAddress}>{item.road_address_name}</Text>
      </View>
      <View style={styles.distanceBadge}>
        <Text style={styles.distanceText}>30m</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <AppBottomSheet
      ref={ref}
      snapPoints={["50%", "80%"]}
      initialIndex={-1}
      enablePanDownToClose={true}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>주변 가맹점</Text>
          <Text style={styles.subtitle}>30m 이내</Text>
        </View>

        <FlatList
          data={places}
          renderItem={renderPlaceItem}
          keyExtractor={(item, index) => `${item.place_name}-${index}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    </AppBottomSheet>
  );
});

export default NearbyPlacesBottomSheet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    marginBottom: 8,
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
    ...font.medium,
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
    ...font.medium,
    color: "white",
  },
});
