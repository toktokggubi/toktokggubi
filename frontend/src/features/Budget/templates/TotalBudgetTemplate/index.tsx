import { View, StyleSheet } from "react-native";
import BudgetCopy from "~features/Budget/ui/BudgetCopy";
import CurrencyInlineInput from "~features/Budget/ui/CurrencyInlineInput";
import AmountSlider from "~features/Budget/ui/AmountSlider";
import BudgetWizardFooter from "~features/Budget/templates/BudgetWizardFooter";
import { TotalBudgetTemplateProps } from "./types";

export default function TotalBudgetTemplate({
  amount,
  onChangeAmount,
  onPressPrev,
  onPressNext,
  nextDisabled,
  min = 100_000,
  max = 4_000_000,
  step = 50_000,
}: TotalBudgetTemplateProps) {
  return (
    <View style={s.container}>
      {/* 상단 카피 (고정 텍스트) */}
      <View style={s.content}>
        <BudgetCopy
          title="전체 예산 설정"
          subtitle="이번 달 사용할 총 예산을 정해주세요."
        />

        {/* 금액 입력 */}
        <View style={s.space} />
        <CurrencyInlineInput value={amount} onChange={onChangeAmount} />

        {/* 슬라이더 */}
        <View style={s.spaceSmall} />
        <AmountSlider
          value={amount}
          onChange={onChangeAmount}
          min={min}
          max={max}
          step={step}
        />
      </View>

      {/* 하단 내비게이션 (고정 단계) */}
      <BudgetWizardFooter
        stepIndex={0}
        stepTotal={4}
        onPressPrev={onPressPrev}
        onPressNext={onPressNext}
        nextDisabled={nextDisabled}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingTop: 32,
  },
  content: { paddingHorizontal: 24 },
  space: { height: 32 },
  spaceSmall: { height: 16 },
});
