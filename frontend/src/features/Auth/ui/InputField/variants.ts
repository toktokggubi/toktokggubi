import { StyleSheet } from "react-native";
import type { InputFieldVariant } from "./types";

export const inputFieldVariants = {
  default: StyleSheet.create({
    wrapper: { borderColor: "#D9D9DE", backgroundColor: "#FFFFFF" },
    input: { color: "#111827" },
    placeholder: { color: "#9CA3AF" },
  }),
} as const satisfies Record<
  InputFieldVariant,
  ReturnType<typeof StyleSheet.create>
>;
