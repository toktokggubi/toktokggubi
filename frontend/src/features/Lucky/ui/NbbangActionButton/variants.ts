import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";
import { StyleSheet } from "react-native";

export const s = StyleSheet.create({
  addBtn: {
    flex: 1,
    paddingVertical: 0,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.BLUE_NORMAL,
    borderWidth: 1,
    borderColor: colors.BLUE_NORMAL,
  },
  addBtnTxt: {
    ...font.medium,
    fontSize: 16,
    color: "white",
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 0,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.GRAY_NORMAL,
  },
  resetBtnTxt: {
    ...font.medium,
    fontSize: 16,
    color: colors.GRAY_NORMAL,
  },
});

