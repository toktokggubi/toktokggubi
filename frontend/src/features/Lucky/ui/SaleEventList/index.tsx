import { colors } from "@/shared/constants/colors";
import React, { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { SaleEventListProps } from "./types";

function SaleEventListImpl({ items }: SaleEventListProps) {
  if (!items.length) return null;
  return (
    <View style={s.wrap}>
      {items.map((it) => {
        // 색상별 배경색과 텍스트 색상 매핑
        const getColorConfig = (color: string) => {
          switch (color) {
            case "yellow":
              return { bg: colors.YELLOW_LIGHT, text: colors.BLUE_DARKER };
            case "blue":
              return { bg: colors.BLUE_NORMAL, text: "#fff" };
            case "green":
              return { bg: colors.GRAY_LIGHT, text: colors.BLUE_DARKER };
            case "purple":
              return { bg: colors.BLUE_LIGHT, text: colors.BLUE_DARKER };
            case "orange":
              return { bg: colors.YELLOW_NORMAL, text: colors.BLUE_DARKER };
            case "pink":
              return { bg: colors.GRAY_NORMAL, text: "#fff" };
            default:
              return { bg: colors.BLUE_NORMAL, text: "#fff" };
          }
        };
        
        const { bg, text: fg } = getColorConfig(it.color);
        return (
          <View key={it.id} style={s.card}>
            <View style={[s.badge, { backgroundColor: bg }]}>
              <Text style={[s.badgeTxt, { color: fg }]}>{it.merchant}</Text>
            </View>
            <Text style={s.ttl}>{it.title}</Text>
            <Text style={s.meta}>{it.period}</Text>
            {it.note ? <Text style={s.note}>{it.note}</Text> : null}
          </View>
        );
      })}
    </View>
  );
}

export const SaleEventList = memo(SaleEventListImpl);

const s = StyleSheet.create({
  wrap: { marginTop: 12 },
  title: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 8,
    color: colors.BLUE_DARKER,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    shadowColor: colors.BLUE_LIGHT_ACTIVE,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 6,
  },
  badgeTxt: { fontWeight: "800", fontSize: 11 },
  ttl: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.BLUE_DARK_ACTIVE,
    marginBottom: 2,
  },
  meta: { color: colors.BLUE_DARK, marginBottom: 4 },
  note: { color: colors.BLUE_DARKER },
});
