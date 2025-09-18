// src/features/Lucky/templates/Molbbang/GameTemplate/variants.ts
import { StyleSheet } from "react-native";
import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";

export const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FAFF",
    paddingHorizontal: 20,
  },

  hint: {
    ...font.medium,
    color: "#6b7280",
    marginTop: 12,
    textAlign: "center",
  },

  bigScore: {
    ...font.bold,
    fontSize: 44,
    lineHeight: 44,
    includeFontPadding: false,
    color: colors.BLUE_DARKER,
    textAlign: "center",
    marginTop: 8,
  },

  centerArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // ▶ 하단 가운데 FAB
  fab: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 24,
    alignItems: "center",
  },
  fabBtn: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: colors.BLUE_NORMAL,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabTxt: { ...font.bold, color: "#fff", fontSize: 16 },

  // ▶ 우하단 타이머
  timerBadge: {
    position: "absolute",
    right: 20,
    bottom: 110, // FAB 위로 뜨도록 약간 위
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: colors.BLUE_NORMAL,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  timerTxt: {
    ...font.bold,
    color: colors.BLUE_NORMAL,
    fontSize: 16,
    lineHeight: 16,
    includeFontPadding: false,
    textAlignVertical: "center",
    textAlign: "center",
  },

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
  modalBtnPrimary: {
    paddingVertical: 5,
    paddingHorizontal: 25,
    borderRadius: 12,
    backgroundColor: colors.BLUE_NORMAL,
  },
  modalBtnPrimaryTxt: { ...font.bold, color: "#fff" },
});
