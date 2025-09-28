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
  // 금액 강조(추가)
  amount: {
    ...font.bold,
    color: "#0f172a",
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
  // 로딩 텍스트(추가)
  listLoading: {
    ...font.regular,
    color: colors.GRAY_DARK,
    textAlign: "center",
    paddingVertical: 12,
  },
  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    gap: 12,
  },
  // 꼴등 행 배경 강조(추가)
  rankRowLoser: {
    backgroundColor: "#fff7f7",
    borderRadius: 8,
  },
  badge: { width: 28, textAlign: "center", ...font.bold, color: "#0f172a" },
  // 꼴등 배지 강조(추가)
  badgeLoser: {
    backgroundColor: "#ef4444",
    color: "#fff",
    borderRadius: 14,
    overflow: "hidden",
  },
  nick: { flex: 1, ...font.medium, color: "#0f172a" },
  score: { ...font.medium, color: "#334155" },
  me: { color: colors.BLUE_NORMAL, fontWeight: "700" },
  // 꼴등 닉네임/점수 강조(추가)
  loserNick: { color: "#ef4444", fontWeight: "700" },
  loserScore: { color: "#ef4444", fontWeight: "700" },
  // 꼴등 칩(추가)
  loserChip: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: "hidden",
    ...font.bold,
    fontSize: 12,
    marginRight: 6,
  },

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
