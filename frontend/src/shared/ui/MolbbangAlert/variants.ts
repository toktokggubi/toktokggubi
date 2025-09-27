// src/shared/ui/MolbbangAlert/variants.ts
import { StyleSheet, Dimensions } from "react-native";
import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";

const { width: screenWidth } = Dimensions.get("window");

export const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(14, 49, 89, 0.3)", // BLUE_DARKER 색상 기반
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: Math.min(screenWidth - 40, 320),
    alignItems: "center",
    shadowColor: colors.BLUE_DARKER,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.BLUE_LIGHT,
  },

  icon: {
    fontSize: 32,
    marginBottom: 12,
  },

  lottieIcon: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },

  title: {
    ...font.bold,
    fontSize: 18,
    color: colors.BLUE_DARKER,
    textAlign: "center",
    marginBottom: 8,
  },

  message: {
    ...font.medium,
    fontSize: 16,
    color: colors.GRAY_DARK,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },

  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },

  confirmButton: {
    flex: 1,
    paddingVertical: 0,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },

  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: colors.GRAY_LIGHT,
    borderWidth: 1,
    borderColor: colors.GRAY_LIGHT_ACTIVE,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },

  confirmButtonText: {
    ...font.bold,
    fontSize: 16,
  },

  cancelButtonText: {
    ...font.medium,
    fontSize: 16,
    color: colors.GRAY_DARK,
  },

  buttonPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },
});
