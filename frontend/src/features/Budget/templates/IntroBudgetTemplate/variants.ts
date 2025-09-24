import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";
import { Dimensions, StyleSheet } from "react-native";

const { height } = Dimensions.get("window");

const PADDING_H = 16;
const PADDING_V = 32;
const TITLE_TOP = Math.max(84, Math.min(112, height * 0.12)); // 화면 높이에 비례한 안전값
const TITLE_GAP = 10;
const MASCOT_SIZE = 400;
const TITLE_TO_MASCOT = -110;

export const FOOTER_RIGHT = 20;
export const FOOTER_BOTTOM = PADDING_V;

export const introTemplateStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND_PRIMARY,
    justifyContent: "space-between", // TotalBudgetTemplate과 동일
    paddingTop: 32, // TotalBudgetTemplate과 동일
  },

  content: {
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
    ...font.bold,
  },

  // 마스코트
  mascot: {
    width: MASCOT_SIZE,
    height: MASCOT_SIZE + 300, // 높이를 더 늘려서 아래 잘림 방지
    resizeMode: "contain",
    alignSelf: "center",
    marginTop: TITLE_TO_MASCOT,
  },

  // 하단 버튼 - BudgetWizardFooter와 동일한 스타일
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end", // NextButton만 오른쪽 정렬
    paddingHorizontal: FOOTER_RIGHT,
    paddingTop: 16,
    paddingBottom: FOOTER_BOTTOM,
  },
});
