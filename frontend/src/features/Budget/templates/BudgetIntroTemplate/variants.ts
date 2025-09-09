import { StyleSheet, Dimensions, Platform, StatusBar } from "react-native";

const { height } = Dimensions.get("window");

/**
 * 모크업 기준 가이드:
 * - 좌/우 패딩: 24
 * - 위/아래 패딩: 32
 * - 카피 블록 상단 여백: 96 (상태바/노치 감안해서 약간 여유)
 * - 카피 줄간격: lineHeight 34, 줄 간격 10
 * - 마스코트: 180x180, 카피와의 간격 56
 * - 우하단 버튼 여백: right 16, bottom 24
 */
const PADDING_H = 16;
const PADDING_V = 32;
const TITLE_TOP = Math.max(84, Math.min(112, height * 0.12)); // 화면 높이에 비례한 안전값
const TITLE_GAP = 10;
const MASCOT_SIZE = 180;
const TITLE_TO_MASCOT = 56;
const FOOTER_RIGHT = 16;
const FOOTER_BOTTOM = PADDING_V;

export const introTemplateStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    // Android 상태바 높이 보정(헤더 숨김일 때)
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 0,
  },

  body: {
    flex: 1,
    paddingHorizontal: PADDING_H,
    paddingVertical: PADDING_V,
  },

  // 카피 영역
  titleWrap: {
    marginTop: TITLE_TOP,
    gap: TITLE_GAP,
  },
  line: {
    fontSize: 22,
    lineHeight: 34,
    color: "#111827",
  },
  hl: {
    color: "#3B82F6",
    fontWeight: "700",
  },

  // 마스코트
  mascot: {
    width: MASCOT_SIZE,
    height: MASCOT_SIZE,
    resizeMode: "contain",
    alignSelf: "center",
    marginTop: TITLE_TO_MASCOT,
  },

  // 우하단 '다음'
  footer: {
    position: "absolute",
    right: FOOTER_RIGHT,
    bottom: FOOTER_BOTTOM,
  },
});
