import React from "react";
import { View, StyleSheet } from "react-native";
import { colors } from "@/shared/constants/colors";

interface DividerDashedProps {
  style?: any;
}

export default function DividerDashed({ style }: DividerDashedProps) {
  return <View style={[styles.container, style]} />;
}

const styles = StyleSheet.create({
  container: {
    height: 1,
    borderTopWidth: 1,
    borderTopColor: colors.GRAY_LIGHT,
    borderStyle: "dashed",
    marginVertical: 16,
  },
});
