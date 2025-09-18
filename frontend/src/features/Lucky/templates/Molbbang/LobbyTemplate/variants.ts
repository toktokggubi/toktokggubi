import { StyleSheet } from "react-native";
import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";

export const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FBFF",
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  h1: { ...font.medium, color: "#0f172a", marginTop: 8 },
  sub: { ...font.medium, color: "#334155", marginTop: 4 },

  memberRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
  },
  pillOnline: { borderColor: "#c7e2ff", backgroundColor: "#eef6ff" },
  pillOffline: { borderColor: "#e5e7eb", backgroundColor: "#f8fafc" },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  dotOn: { backgroundColor: "#10b981" },
  dotOff: { backgroundColor: "#94a3b8" },
  pillTxt: { ...font.medium, color: "#0f172a" },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 12,
  },
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  btn: {
    minWidth: 120,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#fff",
  },
  btnTxt: { ...font.bold, color: "#0f172a" },
  btnDisabled: { opacity: 0.5 },

  primary: {
    backgroundColor: colors.BLUE_NORMAL,
    borderColor: colors.BLUE_NORMAL,
  },
  primaryTxt: { ...font.bold, color: "#fff" },

  readyOn: { backgroundColor: "#e0f2fe", borderColor: "#bae6fd" },
  readyOff: { backgroundColor: "#f1f5f9", borderColor: "#e2e8f0" },
  readyOnTxt: { color: "#0284c7", fontWeight: "700" },
  readyOffTxt: { color: "#64748b", fontWeight: "700" },

  spacerSm: { height: 8 },
  spacerMd: { height: 16 },
});
