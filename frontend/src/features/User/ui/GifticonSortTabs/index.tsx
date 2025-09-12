import React, { memo } from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import type { GifticonSortTabsProps, GifticonSort } from "./types";
import { colors } from "@/shared/constants/colors";

function Tab({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[s.tab, active ? s.active : s.inactive]}
    >
      <Text style={[s.tabText, active ? s.activeText : s.inactiveText]}>
        {label}
      </Text>
    </Pressable>
  );
}

function GifticonSortTabsImpl({ value, onChange }: GifticonSortTabsProps) {
  const set = (v: GifticonSort) => () => onChange(v);

  return (
    <View style={s.wrap}>
      <Tab
        label="최신순"
        active={value === "createdAtDesc"}
        onPress={set("createdAtDesc")}
      />
      <Tab
        label="만료임박순"
        active={value === "remainingAsc"}
        onPress={set("remainingAsc")}
      />
    </View>
  );
}

export const GifticonSortTabs = memo(GifticonSortTabsImpl);

const CHIP_H = 28;

const s = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 14, // ↓ 필요 이상이면 줄이기
  },
  tab: {
    height: CHIP_H,
    paddingHorizontal: 14,
    borderRadius: CHIP_H / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  active: { backgroundColor: colors.BLUE_NORMAL },
  inactive: {
    backgroundColor: colors.BACKGROUND_PRIMARY,
    borderWidth: 1,
    borderColor: colors.GRAY_LIGHT_ACTIVE,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "bold",
    lineHeight: 12,
    textAlignVertical: "center",
  },
  activeText: { color: "#fff" },
  inactiveText: { color: colors.GRAY_LIGHT_ACTIVE },
});
