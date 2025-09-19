import { StyleSheet } from "react-native";
import { colors } from "@/shared/constants/colors";

export const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.BACKGROUND_PRIMARY,
    paddingHorizontal: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
  },
});
