import { StyleSheet } from "react-native";

export const makeNextButtonStyles = (tone: "link" | "filled" = "link") =>
  StyleSheet.create({
    btn: {
      paddingHorizontal: tone === "link" ? 0 : 14,
      paddingVertical: tone === "link" ? 0 : 10,
      borderRadius: 999,
      backgroundColor: tone === "filled" ? "#3B82F6" : "transparent",
    },
    txt: {
      color: tone === "filled" ? "white" : "#3B82F6",
      fontWeight: "700",
      fontSize: 20,
    },
    pressed: { opacity: 0.7 },
    disabled: { opacity: 0.5 },
  });
