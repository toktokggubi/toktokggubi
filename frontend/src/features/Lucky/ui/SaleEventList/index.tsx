import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import type { SaleEventListProps } from "./types";
import { colors } from "@/shared/constants/colors";

function SaleEventListImpl({ items }: SaleEventListProps) {
  if (!items.length) return null;
  return (
    <View style={s.wrap}>
      <Text style={s.title}>상세 정보</Text>
      {items.map((it) => {
        const bg =
          it.color === "yellow"
            ? colors.YELLOW_LIGHT_ACTIVE
            : colors.BLUE_NORMAL;
        const fg = it.color === "yellow" ? colors.BLUE_DARKER : "#fff";
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
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
