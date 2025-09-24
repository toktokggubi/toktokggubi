// src/features/User/ui/GifticonGrid/index.tsx
import React, { memo } from "react";
import {
  FlatList,
  View,
  StyleSheet,
  ListRenderItemInfo,
  Text,
} from "react-native";
import type { GifticonGridProps } from "./types";
import type { Gifticon } from "@/features/User/model/gifticon/types";
import { GifticonCard } from "@/features/User/ui/GifticonCard";
// import { gifticonImages } from "@/features/User/model/gifticon/images"; // 더미 이미지 사용 중단
// import { calcDDay } from "@/features/User/model/gifticon/date"; // 더 이상 사용하지 않음
import { colors } from "@/shared/constants/colors";

const GAP = 12;
const NUM_COLUMNS = 2;

function GifticonGridImpl({
  data,
  onSelect,
  isSelecting = false,
  selectedIds,
  onToggleSelectItem,
  getId,
  extraBottomPadding = 16,
  ListEmptyComponent, // ★ 추가
}: GifticonGridProps) {
  const renderItem = ({ item, index }: ListRenderItemInfo<Gifticon>) => {
    // 서버에서 받은 imageUrl 사용 (item.imageKey는 서버의 imageUrl)
    const imageUrl = item.imageKey;

    // key/id 결정
    const id = getId ? getId(item) : String(item.gifticonId ?? index);
    const checked = !!selectedIds?.has(id);

    const handlePress = () => {
      if (isSelecting && onToggleSelectItem) onToggleSelectItem(item);
      else onSelect(item, index);
    };

    return (
      <View style={s.col}>
        <View style={{ position: "relative" }}>
          <GifticonCard
            imageUrl={imageUrl}
            title={item.label}
            brand={item.merchantName}
            expiresAt={item.expiresAt}
            onPress={handlePress}
          />

          {isSelecting && (
            <View style={[s.checkDot, checked && s.checkDotOn]}>
              {checked && <Text style={s.checkMark}>✓</Text>}
            </View>
          )}

        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={data}
      keyExtractor={(it, idx) =>
        getId ? getId(it) : String(it.gifticonId ?? idx)
      }
      renderItem={renderItem}
      numColumns={NUM_COLUMNS}
      columnWrapperStyle={s.row}
      contentContainerStyle={[
        s.container,
        { paddingBottom: extraBottomPadding },
      ]}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={ListEmptyComponent} // ★ 전달
      contentInsetAdjustmentBehavior="never"
      automaticallyAdjustContentInsets={false}
    />
  );
}

export const GifticonGrid = memo(GifticonGridImpl);

const s = StyleSheet.create({
  container: { 
    paddingBottom: 24,
    paddingTop: 8, // 상단 패딩 추가
  },
  row: { gap: GAP, paddingHorizontal: 16, marginBottom: GAP },
  col: { 
    flex: 1, 
    minWidth: 0,
    maxWidth: "50%", // 최대 너비를 50%로 제한하여 항상 작은 크기 유지
  },

  // 선택 배지
  checkDot: {
    position: "absolute",
    right: 8,
    top: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.GRAY_LIGHT_ACTIVE,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  checkDotOn: {
    backgroundColor: colors.BLUE_NORMAL,
    borderColor: colors.BLUE_NORMAL,
  },
  checkMark: { color: "#fff", fontWeight: "900" },
});
