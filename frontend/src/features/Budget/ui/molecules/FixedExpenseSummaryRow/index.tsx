import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";
import { krw } from "@/shared/utils/currency";
import React, { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { FixedExpenseItem } from "~features/Budget/ui/molecules/FixedExpenseRow/types";

interface FixedExpenseSummaryRowProps {
  item: FixedExpenseItem;
  onPress?: (item: FixedExpenseItem) => void;
}

function FixedExpenseSummaryRowImpl({
  item,
  onPress,
}: FixedExpenseSummaryRowProps) {
  return (
    <Pressable
      onPress={() => onPress?.(item)}
      style={({ pressed }) => [s.row, pressed && { opacity: 0.9 }]}
      accessibilityRole="button"
      accessibilityLabel={`${item.name} ${item.amount}원 상세 편집`}
    >
      <View style={s.left}>
        <Text style={s.name}>{item.name}</Text>
        {item.billingDay && (
          <Text style={s.billingDay}>매달 {item.billingDay}일</Text>
        )}
      </View>
      <View style={s.right}>
        <Text style={s.amount}>{krw(item.amount)}</Text>
      </View>
    </Pressable>
  );
}

export default memo(FixedExpenseSummaryRowImpl);

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.BLUE_LIGHT,
    borderRadius: 12,
    marginBottom: 8,
  },
  left: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    ...font.medium,
    color: colors.GRAY_DARK,
  },
  billingDay: {
    fontSize: 12,
    color: colors.GRAY_NORMAL,
    marginTop: 2,
  },
  right: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 16,
    ...font.bold,
    color: colors.GRAY_DARK,
  },
});
