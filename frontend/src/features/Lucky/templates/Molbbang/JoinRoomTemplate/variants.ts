import { StyleSheet } from "react-native";
import { colors } from "@/shared/constants/colors";

export const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND_PRIMARY, // ✅ 전역 배경색으로 통일
    padding: 16,
  },
  h1: { fontSize: 20, color: colors.BLUE_DARKER, marginBottom: 16 },
  input: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.GRAY_LIGHT_ACTIVE,
  },
  btn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: colors.BLUE_NORMAL,
  },
  btnTxt: { fontSize: 16, color: "white" },
});
