import { StyleSheet } from "react-native";
export const s = StyleSheet.create({
  row: { flexDirection: "row", marginTop: 12 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#EAF3FF",
    borderRadius: 999,
    marginRight: 8,
  },
  active: { backgroundColor: "#288CFF" },
  chipTxt: { color: "#1F3D6D", fontWeight: "600" },
  activeTxt: { color: "white" },
});
