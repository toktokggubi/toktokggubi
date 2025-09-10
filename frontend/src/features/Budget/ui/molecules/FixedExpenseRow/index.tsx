import React, { memo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { colors } from "@/shared/constants/colors";
import type { FixedExpenseRowProps } from "./types";
import { rowHeights, nameMaxLines } from "./variants";

function FixedExpenseRowImpl({ item, onPress }: FixedExpenseRowProps) {
  return (
    <Pressable
      onPress={() => onPress?.(item)}
      style={({ pressed }) => [s.row, pressed && { opacity: 0.9 }]}
      accessibilityRole="button"
      accessibilityLabel={`${item.name} ${item.amount}원 상세 편집`}
    >
      <Text style={[s.cell, s.name]} numberOfLines={nameMaxLines}>
        {item.name}
      </Text>
      <Text style={[s.cell, s.amount]}>{item.amount.toLocaleString()}원</Text>
      <View style={[s.cell, s.checkboxWrap]}>
        <View style={[s.checkbox, item.includeInBudget && s.checkboxOn]}>
          {item.includeInBudget ? <Text style={s.check}>✓</Text> : null}
        </View>
      </View>
    </Pressable>
  );
}

export default memo(FixedExpenseRowImpl);

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.BLUE_LIGHT,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: rowHeights,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  cell: { paddingVertical: 0 },
  name: { flex: 1, marginRight: 8, color: "#111" },
  amount: { width: 110, textAlign: "right", marginRight: 8, color: "#111" },
  checkboxWrap: { width: 60, alignItems: "center", justifyContent: "center" },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.BLUE_NORMAL,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxOn: { backgroundColor: colors.BLUE_NORMAL },
  check: { color: "#fff", fontWeight: "700" },
});
