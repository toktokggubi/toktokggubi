import React, { memo, useMemo } from "react";
import {
  View,
  Pressable,
  Text,
  StyleSheet,
  FlatList,
  ListRenderItemInfo,
} from "react-native";
import type { CategoryChipsProps } from "./types";
import { colors } from "@/shared/constants/colors";

const LABELS: Record<CategoryChipsProps["value"], string> = {
  cafe: "카페",
  movie: "영화",
  shopping: "쇼핑",
  life: "생활",
  burger: "햄버거",
  etc: "기타",
};

type Item = { key: CategoryChipsProps["value"]; label: string };

function CategoryChipsImpl({ value, onChange }: CategoryChipsProps) {
  const data: Item[] = useMemo(
    () =>
      (Object.keys(LABELS) as Array<keyof typeof LABELS>).map((k) => ({
        key: k,
        label: LABELS[k],
      })),
    []
  );

  const renderItem = ({ item }: ListRenderItemInfo<Item>) => {
    const active = value === item.key;
    return (
      <Pressable
        key={item.key}
        onPress={() => onChange(item.key)}
        style={[s.chip, active && s.active]}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        accessibilityLabel={item.label}
      >
        <Text style={[s.txt, active && s.activeTxt]}>{item.label}</Text>
      </Pressable>
    );
  };

  return (
    <View style={s.wrap}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(it) => it.key}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.content}
        ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
      />
    </View>
  );
}

export const CategoryChips = memo(CategoryChipsImpl);

const s = StyleSheet.create({
  wrap: { marginBottom: 12 },
  content: { paddingRight: 8 }, // 끝에 여백
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: colors.BLUE_LIGHT,
  },
  active: { backgroundColor: colors.BLUE_NORMAL },
  txt: { color: colors.BLUE_DARK_ACTIVE, fontWeight: "600" },
  activeTxt: { color: "#fff" },
});
