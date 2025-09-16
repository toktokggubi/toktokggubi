import { StyleSheet } from "react-native";
import type { ButtonVariant } from "./types";

export const ButtonVariants = {
  default: StyleSheet.create({
    button: { backgroundColor: "#288CFF" },
  }),
  kakaoButton: StyleSheet.create({
    button: { backgroundColor: "#FEE500" },
    text: { color: "#313339" },
  }),
} as const satisfies Record<
  ButtonVariant,
  ReturnType<typeof StyleSheet.create>
>;
