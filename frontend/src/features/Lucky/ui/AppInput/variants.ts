import { StyleSheet } from "react-native";
import { colors } from "@/shared/constants/colors";

export const s = StyleSheet.create({
  input: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.GRAY_LIGHT_ACTIVE,
  },
});
