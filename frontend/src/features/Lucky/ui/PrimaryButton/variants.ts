import { StyleSheet } from "react-native";
import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";

export const s = StyleSheet.create({
  btn: {
    paddingVertical: 0,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: colors.BLUE_NORMAL,
  },
  btnTxt: { ...font.medium, fontSize: 18, color: "white" },
});
