import { StyleSheet } from "react-native";
import type { ButtonVariant } from "./types";

export const ButtonVariants = {
  default: StyleSheet.create({
    button: { backgroundColor: "#288CFF" },
  }),
} as const satisfies Record<
  ButtonVariant,
  ReturnType<typeof StyleSheet.create>
>;
