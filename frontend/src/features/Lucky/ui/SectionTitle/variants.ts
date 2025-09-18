import { StyleSheet } from "react-native";
import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";

export const s = StyleSheet.create({
  wrap: {
    alignItems: "center",
    marginBottom: 16,
  },
  icon: {
    width: 200,
    height: 200,
    marginBottom: 8,
  },
  title: {
    ...font.bold,
    fontSize: 22,
    color: colors.BLUE_DARKER,
    textAlign: "center",
  },
});
