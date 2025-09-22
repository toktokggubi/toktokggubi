import React, { memo } from "react";
import { View, Text } from "react-native";
import type { ShareListProps } from "./types";
import { s } from "./variants";

export const NbbangShareList = memo(function NbbangShareList({
  items,
}: ShareListProps) {
  if (!items.length) return null;
  return (
    <View style={s.card}>
      {items.map((it) => (
        <View style={s.row} key={it.id}>
          <Text style={s.name}>{it.name}</Text>
          <Text style={s.amount}>{it.amount.toLocaleString()}원</Text>
        </View>
      ))}
    </View>
  );
});
