import { View, Text, StyleSheet } from "react-native";
import { colors } from "@/shared/constants/colors";
import { BudgetCopyProps } from "./types";

export default function BudgetCopy({ title, subtitle }: BudgetCopyProps) {
  return (
    <View style={{ gap: 10 }}>
      <Text style={s.title}>{title}</Text>
      {!!subtitle && <Text style={s.sub}>{subtitle}</Text>}
    </View>
  );
}
const s = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "800", color: "#111" },
  sub: { fontSize: 16, color: colors.GRAY_NORMAL },
});
