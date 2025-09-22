import { StyleSheet } from "react-native";
import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";

export const s = StyleSheet.create({
  // 레이아웃
  container: { flex: 1, padding: 16, backgroundColor: "#F8FBFF" },
  h1: { fontSize: 20, color: colors.BLUE_DARK },
  sub: { marginTop: 4, fontSize: 14, color: colors.BLUE_LIGHT_ACTIVE },

  // 참가자 뱃지
  memberRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillOnline: { backgroundColor: "#E8F5FF", borderColor: "#BBDFFF" },
  pillOffline: { backgroundColor: "#F3F4F6", borderColor: "#E5E7EB" },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  dotOn: { backgroundColor: "#22C55E" },
  dotOff: { backgroundColor: "#9CA3AF" },
  pillTxt: { fontSize: 13, color: "#0f172a" },

  // 점수
  score: {
    fontSize: 18,
    ...font.bold,
    color: colors.BLUE_DARK,
    textAlign: "center",
  },

  // 간격자
  spacerLg: { height: 24 },
  spacerMd: { height: 12 },

  // 버튼/행
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
  },
  btnTxt: { fontSize: 14, color: "#0f172a" },
  primary: { backgroundColor: colors.BLUE_NORMAL },
  primaryTxt: { color: "#FFFFFF", ...font.bold },
  btnDisabled: { opacity: 0.5 },

  // 준비 토글 전용
  readyOn: {
    backgroundColor: "#DCFCE7",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  readyOnTxt: { color: "#166534", ...font.bold },
  readyOff: {
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FED7AA",
  },
  readyOffTxt: { color: "#9A3412", ...font.bold },

  // 스크린리더용
  visuallyHidden: {
    position: "absolute",
    width: 1,
    height: 1,
    left: -9999,
    opacity: 0,
  },

  // 종료 결과
  resultsWrap: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  resultsTitle: { fontSize: 16, color: colors.BLUE_DARK, marginBottom: 8 },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    gap: 10,
  },
  rankBadge: {
    width: 28,
    textAlign: "center",
    borderRadius: 6,
    paddingVertical: 2,
    backgroundColor: "#F3F4F6",
    color: "#111827",
    ...font.bold,
  },
  rankFirst: { backgroundColor: "#FEF3C7", color: "#92400E" }, // 1등
  rankLast: { backgroundColor: "#FFE4E6", color: "#9F1239" }, // 꼴등
  resultNick: { flex: 1, fontSize: 15, color: "#0f172a" },
  resultScore: { fontSize: 15, ...font.bold, color: colors.BLUE_DARK },
  me: { color: colors.BLUE_NORMAL },
});
