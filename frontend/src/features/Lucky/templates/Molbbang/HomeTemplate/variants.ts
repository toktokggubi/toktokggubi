// src/features/Lucky/templates/Molbbang/HomeTemplate/variants.ts
import { StyleSheet, Platform } from "react-native";
import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";

export const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.BACKGROUND_PRIMARY, // ✅ 배경색 추가
  },
  // 🔹 비디오를 전체 화면에 깔기
  video: {
    position: "absolute",
    top: 240, // 투명 구멍의 Y 좌표
    left: 55, // 투명 구멍의 X 좌표
    width: 300, // 구멍 너비
    height: 150, // 구멍 높이
    zIndex: 1, // 이미지보다 밑에
  },

  // 🔹 비디오 위에 올려지는 배경 이미지
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    width: "100%",
    height: "100%",
  },
  // 🔹 UI 컨테이너 (비디오/이미지 위에 얹히도록 zIndex 높임)
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 100,
    zIndex: 10,
  },
  titleBox: {
    marginTop: 40,
    width: 225,
    height: 53,
    backgroundColor: colors.YELLOW_NORMAL,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: colors.BLUE_DARKER,
    borderRadius: 10,
    marginBottom: 267,
  },
  titleTxt: {
    fontSize: 22,
    ...font.bold,
    color: colors.BLUE_DARKER,
    textAlign: "center",
    ...(Platform.OS === "android" ? { includeFontPadding: false } : null),
  },
  btnRow: {
    flexDirection: "row",
    gap: 24, // 버튼 사이 간격
    marginTop: 12,
  },
  btn: {
    width: 140,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 4,
    borderColor: colors.BLUE_DARKER,
    backgroundColor: colors.GRAY_LIGHT,
  },
  btnTxt: {
    fontSize: 16,
    lineHeight: 16,
    ...font.bold,
    color: colors.BLUE_DARKER,
  },
  primary: { backgroundColor: colors.GRAY_LIGHT },
  primaryTxt: { color: colors.BLUE_DARKER },
});
