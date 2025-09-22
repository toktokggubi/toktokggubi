import { StyleSheet } from "react-native";
import { font } from "@/shared/typography/font";
import { colors } from "@/shared/constants/colors";

// src/features/Lucky/templates/Molbbang/ResultTemplate/variants.ts
export const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND_PRIMARY,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  h1: {
    ...font.bold,
    color: "#0f172a",
    marginTop: 8,
    fontSize: 20,
    textAlign: "center",
  },
  sub: {
    ...font.regular,
    fontSize: 20,
    color: colors.BLUE_DARKER,
    marginTop: 30,
    textAlign: "center",
  },

  // 캐릭터
  characterWrap: { marginTop: 0, alignItems: "center" },
  characterImg: { width: 200, height: 200 },
  characterName: {
    marginTop: 0,
    marginBottom: 20,
    ...font.bold,
    fontSize: 20,
    lineHeight: 20,
    includeFontPadding: false,
    textAlign: "center",
    color: colors.BLUE_DARKER,
  },

  // 랭킹 박스
  list: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  listTitle: {
    ...font.bold,
    fontSize: 14,
    color: colors.GRAY_DARKER,
    marginBottom: 8,
    textAlign: "center",
  },
  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    gap: 12,
  },
  badge: { width: 28, textAlign: "center", ...font.bold, color: "#0f172a" },
  nick: { flex: 1, ...font.medium, color: "#0f172a" },
  score: { ...font.medium, color: "#334155" },
  me: { color: colors.BLUE_NORMAL, fontWeight: "700" },

  // 버튼
  btn: {
    marginTop: 24,
    alignSelf: "center",
    width: "100%",
    paddingVertical: 0,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.BLUE_NORMAL,
  },
  btnTxt: { ...font.bold, fontSize: 16 },

  primary: {
    backgroundColor: colors.BLUE_NORMAL,
  },
  primaryTxt: { ...font.bold, color: "#fff" },
  pay: { backgroundColor: colors.BLUE_NORMAL },
  payTxt: { ...font.bold, color: "#fff" },
  secondary: {
    marginTop: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  secondaryTxt: { ...font.bold, color: colors.GRAY_DARK },
});
