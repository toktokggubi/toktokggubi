// src/features/Lucky/templates/Molbbang/LobbyTemplate/variants.ts
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

  // 상단 영역
  topArea: { marginTop: 0, alignItems: "center" },
  topGuide: { ...font.bold, color: "#3b82f6", marginTop: 0 },
  amountNum: {
    ...font.bold,
    fontSize: 40,
    color: colors.BLUE_NORMAL,
    marginTop: 0,
    textAlign: "center",
    lineHeight: 40,
    includeFontPadding: false,
  },
  amountWon: {
    ...font.regular,
    fontSize: 40,
    color: colors.BLUE_NORMAL,
    textAlign: "center",
    lineHeight: 44,
    includeFontPadding: false,
  },

  codeRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  codeText: { ...font.medium, color: colors.GRAY_NORMAL },
  codeBold: { ...font.bold, color: colors.BLUE_DARKER },
  copyBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#eef2ff",
    alignItems: "center",
    justifyContent: "center",
  },
  copyBtnDisabled: { opacity: 0.5 },
  copyBtnPressed: { opacity: 0.7 },

  // 라운드 헤더
  sectionHeader: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: { ...font.bold, fontSize: 16, color: colors.BLUE_DARKER },
  sectionMeta: { ...font.medium, color: colors.GRAY_NORMAL },

  // 멤버 카드
  memberCard: {
    marginTop: 8,
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.GRAY_LIGHT,
    shadowColor: colors.BLUE_DARK,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 7,
  },
  memberItem: {
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.GRAY_LIGHT,
  },
  memberLeft: { flexDirection: "row", alignItems: "center" },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  dotOn: { backgroundColor: "#10b981" },
  dotOff: { backgroundColor: colors.GRAY_NORMAL },
  memberName: { ...font.medium, color: colors.BLUE_DARKER },

  badge: {
    minWidth: 100,
    paddingVertical: 0,
    paddingHorizontal: 10,
    borderRadius: 50,
    alignItems: "center",
  },
  badgeReady: { backgroundColor: colors.BLUE_NORMAL },
  badgeWaiting: { backgroundColor: colors.GRAY_LIGHT },
  badgeTxt: { ...font.bold, fontSize: 12 },
  badgeReadyTxt: { color: "#fff" },
  badgeWaitingTxt: { color: colors.GRAY_DARKER },

  // 하단 CTA (위아래 배치)
  ctaArea: { marginTop: 30, paddingVertical: 16, gap: 12 },
  btn: {
    alignItems: "center",
    justifyContent: "center", // ✅ 세로 중앙 정렬
    paddingVertical: 14,
    borderRadius: 12,
    height: 70,
  },

  // 시안: 위 버튼은 회색(비활성 느낌)
  btnGhost: { backgroundColor: colors.GRAY_LIGHT },
  btnGhostTxt: {
    ...font.bold,
    color: colors.GRAY_DARK,
    fontSize: 18,
    lineHeight: 18,
    includeFontPadding: false,
  },
  btnDisabledIfDesign: { opacity: 1 },

  btnPrimary: {
    backgroundColor: colors.BLUE_NORMAL,
  },
  btnPrimaryTxt: {
    ...font.bold,
    color: "#fff",
    fontSize: 18,
    lineHeight: 18,
    includeFontPadding: false,
  },
  btnDisabled: { opacity: 0.5 },
});
