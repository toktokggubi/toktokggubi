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
  sub: { ...font.medium, color: "#334155", marginTop: 4 },

  score: { ...font.medium, color: "#0f172a", textAlign: "center" },

  btn: {
    minWidth: 160,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#fff",
    alignSelf: "center",
  },
  btnTxt: { ...font.bold, color: "#0f172a" },
  primary: {
    backgroundColor: colors.BLUE_NORMAL,
    borderColor: colors.BLUE_NORMAL,
  },
  primaryTxt: { ...font.bold, color: "#fff" },

  spacerMd: { height: 16 },
  spacerLg: { height: 24 },
  rankWrap: {
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  rankTitle: { ...font.bold, color: "#0f172a", marginBottom: 8 },
  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 6,
  },
  rankBadge: { width: 28, textAlign: "center", ...font.bold, color: "#0f172a" },
  rankNick: { flex: 1, ...font.medium, color: "#0f172a" },
  rankScore: { ...font.medium, color: "#334155" },
  me: { color: colors.BLUE_NORMAL, fontWeight: "700" },
});
