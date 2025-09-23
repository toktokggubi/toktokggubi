import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";
import { krw } from "@/shared/utils/currency";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface BudgetSummaryHeaderRowProps {
  title: string;
  amount: number;
  mode?: 'edit' | 'ai-setup';
}

export default function BudgetSummaryHeaderRow({
  title,
  amount,
  mode = 'edit',
}: BudgetSummaryHeaderRowProps) {
  return (
    <View style={[styles.container, mode === 'ai-setup' && styles.aiModeContainer]}>
      <Text style={[styles.title, mode === 'ai-setup' && styles.aiModeTitle]}>{title}</Text>
      <Text style={[styles.amount, mode === 'ai-setup' && styles.aiModeAmount]}>{krw(amount)}</Text>
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
    ...font.medium,
    color: colors.GRAY_DARK,
  },
  amount: {
    fontSize: 16,
    ...font.bold,
    color: colors.BLUE_NORMAL,
  },
  aiModeContainer: {
    backgroundColor: colors.BLUE_NORMAL,
  },
  aiModeTitle: {
    color: "#ffffff",
  },
  aiModeAmount: {
    color: "#ffffff",
  },
});
