import { StyleSheet } from "react-native";
import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";

export const s = StyleSheet.create({
  // 엣지-투-엣지: 상/하 safe area 무시. 배경색 확장.
  container: {
    flex: 1,
    backgroundColor: "#0B1220",
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 0,
  },
  sub: { ...font.medium, color: "#dbeafe", marginTop: 8, textAlign: "center" },

  score: {
    fontSize: 22,
    lineHeight: 28,
    color: "#e2e8f0",
    textAlign: "center",
  },

  btn: {
    minWidth: 180,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#ffffff10",
    alignSelf: "center",
  },
  btnTxt: { ...font.bold, color: "#e2e8f0" },
  primary: {
    backgroundColor: colors.BLUE_NORMAL,
    borderColor: colors.BLUE_NORMAL,
  },
  primaryTxt: { ...font.bold, color: "#fff" },

  spacerMd: { height: 16 },
  spacerLg: { height: 24 },

  // ── 모달
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 480,
    borderRadius: 16,
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#1f2937",
    padding: 16,
  },
  modalTitle: {
    ...font.bold,
    color: "#f8fafc",
    fontSize: 18,
    marginBottom: 12,
    textAlign: "center",
  },

  rankWrap: {
    borderRadius: 12,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1f2937",
    padding: 8,
    maxHeight: 360,
  },
  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  rankBadge: { width: 32, textAlign: "center", ...font.bold, color: "#f8fafc" },
  rankNick: { flex: 1, ...font.medium, color: "#e5e7eb" },
  rankScore: { ...font.medium, color: "#cbd5e1" },

  modalBtns: { marginTop: 14, alignItems: "center" },
});
