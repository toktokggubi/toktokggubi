// src/shared/ui/NotificationAlert/variants.ts
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

  characterImage: {
    width: 80,
    height: 80,
    marginBottom: 16,
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
    width: "100%",
  },

  confirmButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: colors.BLUE_NORMAL,
    borderWidth: 1,
    borderColor: colors.BLUE_NORMAL,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
  },

  confirmButtonText: {
    ...font.bold,
    fontSize: 14,
    color: "#fff",
  },

  buttonPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },
});
