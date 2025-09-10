import React from "react";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import StepDots from "@/features/Budget/ui/atoms/StepDots";
import PrevButton from "@/features/Budget/ui/atoms/PrevButton";
import NextButton from "@/features/Budget/ui/atoms/NextButton";
import { BudgetWizardFooterProps } from "./types";

export default function BudgetWizardFooter({
  stepIndex,
  stepTotal,
  onPressPrev,
  onPressNext,
  nextDisabled,
  nextTone = "link",
  prevTone = "link",
  baseBottom = 32, // ✅ 기본 하단 여백
  style, // (선택) 외부 스타일 병합
}: BudgetWizardFooterProps) {
  const insets = useSafeAreaInsets();
  const paddingBottom = Math.max(baseBottom, (insets.bottom || 0) + 12); // ✅ 요청식

  return (
    <View style={[s.wrap, { paddingBottom }, style]}>
      <PrevButton tone={prevTone} onPress={onPressPrev} />
      <StepDots index={stepIndex} total={stepTotal} />
      <NextButton
        tone={nextTone}
        onPress={onPressNext}
        disabled={nextDisabled}
      />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16, // ⬅️ 위 여백만 고정
    // paddingBottom은 런타임에 주입
  },
});
