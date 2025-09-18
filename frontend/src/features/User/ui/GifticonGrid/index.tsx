import React, { memo } from "react";
import { FlatList, View, StyleSheet, ListRenderItemInfo } from "react-native";
import type { GifticonGridProps } from "./types";
import type { Gifticon } from "@/features/User/model/gifticon/types";
import { GifticonCard } from "@/features/User/ui/GifticonCard";
import { gifticonImages } from "@/features/User/model/gifticon/images";
import { calcDDay } from "@/features/User/model/gifticon/date";

const GAP = 12;
const NUM_COLUMNS = 2;

function GifticonGridImpl({ data, onSelect }: GifticonGridProps) {
  const renderItem = ({ item, index }: ListRenderItemInfo<Gifticon>) => {
    const src = gifticonImages[item.imageKey];
    return (
      <View style={s.col}>
        <GifticonCard
          imageSource={src}
          title={item.label}
          brand={item.merchantName}
          dDay={calcDDay(item.expiresAt)}
          onPress={() => onSelect(item, index)}
        />
      </View>
    );
  };

  return (
    <FlatList
      data={data}
      keyExtractor={(it, idx) => {
        return String(it.gifticonId);
      }}
      renderItem={renderItem}
      numColumns={NUM_COLUMNS}
      columnWrapperStyle={s.row}
      contentContainerStyle={s.container}
      showsVerticalScrollIndicator={false}
    />
  );
}

export const GifticonGrid = memo(GifticonGridImpl);

const s = StyleSheet.create({
  container: { paddingBottom: 24 },
  row: { gap: GAP, paddingHorizontal: 16, marginBottom: GAP },
  col: { flex: 1, minWidth: 0 },
});
