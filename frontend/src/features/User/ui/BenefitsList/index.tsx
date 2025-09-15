import {
  CATEGORY_ICON_BY_NAME,
  CATEGORY_ICON_FALLBACK,
} from "@/shared/constants/categoryIcons";
import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";
import React, { memo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import type { BenefitsListProps } from "./types";

function Row({
  name,
  percent,
  category,
}: {
  name: string;
  percent: number;
  category: string;
}) {
  const icon = CATEGORY_ICON_BY_NAME[category] ?? CATEGORY_ICON_FALLBACK;

  return (
    <View style={s.row}>
      <Image source={icon} style={s.icon} />
      <Text style={s.oneLine} numberOfLines={1} ellipsizeMode="tail">
        <Text style={s.franchise}>{name}</Text>
        <Text> </Text>
        <Text style={s.percent}>{percent}%</Text>
        <Text> 결제일할인</Text>
      </Text>
    </View>
  );
}

function BenefitsListImpl({ benefits }: BenefitsListProps) {
  if (!benefits || benefits.length === 0) {
    return (
      <View style={[s.card, s.empty]}>
        <Text style={s.emptyText}>등록된 혜택이 없어요</Text>
      </View>
    );
  }

  return (
    <View style={s.card}>
      <Text style={s.title}>혜택 안내</Text>
      <View style={s.divider} />
      {benefits.map((b) => (
        <Row
          key={`${b.franchiseId}-${b.franchiseName}`}
          name={b.franchiseName}
          percent={b.discountRate}
          category={b.representativeCategory.categoryName}
        />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    shadowColor: colors.GRAY_DARK,
    elevation: 5,
  },
  title: {
    fontSize: 16,
    ...font.bold,
    color: colors.BLUE_DARKER,
    marginBottom: 6,
  },
  divider: {
    height: 1,
    backgroundColor: colors.GRAY_LIGHT,
    marginBottom: 6,
  },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  icon: { width: 24, height: 24, marginRight: 12, resizeMode: "contain" },
  oneLine: {
    flex: 1, // 아이콘 옆에서 남은 공간 모두 사용
    flexShrink: 1, // 길면 줄임표로 잘리도록
    fontSize: 14,
    color: colors.BLUE_DARKER,
  },
  franchise: { fontSize: 14, ...font.bold, color: colors.BLUE_DARKER },
  percent: { ...font.bold, color: colors.BLUE_DARKER },
  rowTexts: { flex: 1 },
  desc: { marginTop: 2, color: colors.GRAY_DARK, fontSize: 13 },
  bold: { ...font.bold },
  empty: { alignItems: "center", justifyContent: "center" },
  emptyText: { color: colors.GRAY_NORMAL },
});

export default memo(BenefitsListImpl);
