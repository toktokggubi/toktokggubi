import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "@/shared/constants/colors";
import { krw } from "@/shared/utils/currency";

interface BudgetSummaryHeaderRowProps {
  title: string;
  amount: number;
}

export default function BudgetSummaryHeaderRow({
  title,
  amount,
}: BudgetSummaryHeaderRowProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.amount}>{krw(amount)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.BLUE_LIGHT,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.GRAY_DARK,
  },
  amount: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.BLUE_NORMAL,
  },
});
