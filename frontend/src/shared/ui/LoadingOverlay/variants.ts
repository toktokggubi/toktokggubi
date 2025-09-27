// src/shared/ui/LoadingOverlay/variants.ts
import { StyleSheet, Dimensions } from "react-native";
import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.7)", // 흰색 배경에 투명도
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  overlayTransparent: {
    backgroundColor: "rgba(255, 255, 255, 0.7)", // 투명한 흰색 배경
  },

  container: {
    alignItems: "center",
  },

  gifIcon: {
    width: 300,
    height: 150,
    marginBottom: 8,
  },

  message: {
    ...font.medium,
    fontSize: 16,
    color: colors.BLUE_DARKER,
    textAlign: "center",
    lineHeight: 18,
    marginTop: 4,
  },
});
