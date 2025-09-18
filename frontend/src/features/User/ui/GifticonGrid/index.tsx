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
import { gifticonImages } from "@/features/User/model/gifticon/images";
import { calcDDay } from "@/features/User/model/gifticon/date";
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
    const src = gifticonImages[item.imageKey];

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
            imageSource={src}
            title={item.label}
            brand={item.merchantName}
            dDay={calcDDay(item.expiresAt)}
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
    />
  );
}

export const GifticonGrid = memo(GifticonGridImpl);

const s = StyleSheet.create({
  container: { paddingBottom: 24, flexGrow: 1 }, // ★ flexGrow:1 줘야 가운데 배치 잘됨
  row: { gap: GAP, paddingHorizontal: 16, marginBottom: GAP },
  col: { flex: 1, minWidth: 0 },

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
