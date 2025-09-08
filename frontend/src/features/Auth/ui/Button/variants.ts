import { StyleSheet } from "react-native";
import type { ButtonVariant } from "./types";

export const ButtonVariants = {
  primary: StyleSheet.create({
    button: { backgroundColor: "#3B82F6" },
  }),
  secondary: StyleSheet.create({
    button: { backgroundColor: "#E5E7EB" },
  }),
  danger: StyleSheet.create({
    button: { backgroundColor: "#EF4444" },
  }),
} as const satisfies Record<
  ButtonVariant,
  ReturnType<typeof StyleSheet.create>
>;
