// src/features/Lucky/ui/SeriesCards/index.tsx
import React, { memo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import type { SeriesCardsProps } from "./types";
import { colors } from "@/shared/constants/colors";

function SeriesCardsImpl({ onPressNbbang, onPressMolbbang }: SeriesCardsProps) {
  return (
    <View>
      <Text style={s.title}>빵빵 시리즈</Text>
      <View style={s.row}>
        <Pressable style={s.card} onPress={onPressNbbang}>
          <Text style={s.cardTitle}>N빵</Text>
          <Text style={s.desc}>함께 쓴 비용을 공평하게!</Text>
        </Pressable>
        <Pressable style={s.card} onPress={onPressMolbbang}>
          <Text style={s.cardTitle}>몰빵</Text>
          <Text style={s.desc}>한명이 전부 지불하는 한 번 슈팅!</Text>
        </Pressable>
      </View>
    </View>
  );
}

export const SeriesCards = memo(SeriesCardsImpl);

const s = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.BLUE_DARKER,
    marginBottom: 8,
  },
  row: { flexDirection: "row", gap: 12 },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.BLUE_NORMAL,
    marginBottom: 6,
  },
  desc: { color: colors.BLUE_DARK, lineHeight: 18 },
});
