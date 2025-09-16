import React, { memo, useMemo } from "react";
import { View, Pressable, Text, StyleSheet, FlatList } from "react-native";
import {
  CATEGORY_VALUES,
  CATEGORY_LABELS,
  type Category,
} from "@/shared/constants/categories";
import { colors } from "@/shared/constants/colors";
import type { CategoryChipsProps } from "./types";

type Item = { key: Category; label: string };

function CategoryChipsImpl({ value, onChange }: CategoryChipsProps) {
  const data: Item[] = useMemo(
    () => CATEGORY_VALUES.map((k) => ({ key: k, label: CATEGORY_LABELS[k] })),
    []
  );

  return (
    <View style={s.wrap}>
      <FlatList
        horizontal
        data={data}
        keyExtractor={(it) => it.key}
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
        renderItem={({ item }) => {
          const active = value === item.key;
          return (
            <Pressable
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
        }}
      />
    </View>
  );
}

export const CategoryChips = memo(CategoryChipsImpl);

const s = StyleSheet.create({
  wrap: { marginBottom: 12 },
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
