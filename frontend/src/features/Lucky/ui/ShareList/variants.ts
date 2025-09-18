import { StyleSheet } from "react-native";
export const s = StyleSheet.create({
  card: {
    marginTop: 16,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E3E9F5",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  name: { fontWeight: "600", color: "#1A202C" },
  amount: { fontWeight: "700", color: "#0D3B66" },
});
