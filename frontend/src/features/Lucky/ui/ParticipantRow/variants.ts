import { StyleSheet } from "react-native";
export const s = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  name: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E3E9F5",
  },
  weightBox: { flexDirection: "row", alignItems: "center", marginLeft: 8 },
  weightLabel: { marginRight: 6, color: "#4A5568" },
  weightInput: {
    width: 60,
    textAlign: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E3E9F5",
  },
  removeBtn: {
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#FDECEC",
  },
  removeTxt: { color: "#C53030", fontWeight: "600" },
});
