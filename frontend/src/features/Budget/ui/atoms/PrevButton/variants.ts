import { StyleSheet } from "react-native";

export const makePrevButtonStyles = (tone: "link" | "filled" = "link") =>
  StyleSheet.create({
    btn: {
      paddingHorizontal: tone === "link" ? 0 : 14,
      paddingVertical: tone === "link" ? 0 : 10,
      borderRadius: 999,
      backgroundColor: tone === "filled" ? "#E5E7EB" : "transparent",
    },
    txt: {
      color: tone === "filled" ? "#111827" : "#3B82F6",
      fontWeight: "700",
      fontSize: 14,
    },
    pressed: { opacity: 0.7 },
    disabled: { opacity: 0.5 },
  });
