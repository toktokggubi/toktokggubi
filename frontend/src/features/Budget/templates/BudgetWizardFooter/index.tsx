import { View, StyleSheet } from "react-native";
import StepDots from "~features/Budget/ui/StepDots";
import PrevButton from "~features/Budget/ui/PrevButton";
import NextButton from "~features/Budget/ui/NextButton";
import { BudgetWizardFooterProps } from "./types";

export default function BudgetWizardFooter({
  stepIndex,
  stepTotal,
  onPressPrev,
  onPressNext,
  nextDisabled,
  nextTone = "filled",
  prevTone = "link",
}: BudgetWizardFooterProps) {
  return (
    <View style={s.wrap}>
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
    paddingVertical: 16,
  },
});
