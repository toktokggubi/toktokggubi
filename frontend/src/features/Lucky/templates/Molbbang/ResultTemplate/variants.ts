import { StyleSheet } from "react-native";
import { font } from "@/shared/typography/font";
import { colors } from "@/shared/constants/colors";

export const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FBFF",
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  h1: { ...font.bold, color: "#0f172a", marginTop: 8 },
  sub: { ...font.light, color: "#334155", marginTop: 4 },

  card: {
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  rowTitle: { ...font.medium, color: "#0f172a", marginTop: 4 },
  rowText: { ...font.bold, color: "#0f172a", marginTop: 4 },

  divider: { height: 1, backgroundColor: "#e5e7eb", marginVertical: 10 },

  list: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
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

  btn: {
    marginTop: 20,
    alignSelf: "center",
    minWidth: 160,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#fff",
  },
  btnTxt: { ...font.bold, color: "#0f172a" },
  primary: {
    backgroundColor: colors.BLUE_NORMAL,
    borderColor: colors.BLUE_NORMAL,
  },
  primaryTxt: { ...font.bold, color: "#fff" },
});
