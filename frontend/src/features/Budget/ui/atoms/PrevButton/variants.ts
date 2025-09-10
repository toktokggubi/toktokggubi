import { StyleSheet } from "react-native";

/**
 * NextButton 과 동일한 API(tone)로 맞춰서 재사용성 확보
 * - link : 파란 텍스트 버튼
 * - filled : 회색 배경의 채움 버튼 (구분감만 다르게)
 */
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
