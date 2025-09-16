import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { colors } from "@/shared/constants/colors";
import { FOOTER_BOTTOM } from "@/features/Budget/templates/IntroBudgetTemplate/variants";
import BudgetCopy from "@/features/Budget/ui/molecules/BudgetCopy";
import CurrencyInlineInput from "@/features/Budget/ui/atoms/CurrencyInlineInput";
import AmountSlider from "@/features/Budget/ui/atoms/AmountSlider";
import BudgetWizardFooter from "@/features/Budget/ui/organisms/BudgetWizardFooter";
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
  // 키패드 입력용 상태 (슬라이더와 분리)
  const [keyboardValue, setKeyboardValue] = useState<string>("");
  const [isKeyboardMode, setIsKeyboardMode] = useState(false);

  // 슬라이더 값 변경 (제한사항 적용)
  const handleSliderChange = (value: number) => {
    setIsKeyboardMode(false);
    onChangeAmount(value);
  };

  // 키패드 입력 시작 (현재 값 초기화)
  const handleKeyboardStart = () => {
    setIsKeyboardMode(true);
    setKeyboardValue("");
  };

  // 키패드 입력 값 변경 (자유 입력)
  const handleKeyboardChange = (value: string) => {
    setKeyboardValue(value);
    const numValue = parseInt(value) || 0;
    onChangeAmount(numValue);
  };
  return (
    <SafeAreaView style={s.container} edges={["top", "bottom"]}>
      {/* 상단 제목과 설명 */}
      <View style={s.header}>
        <BudgetCopy
          title="전체 예산 설정"
          subtitle="이번 달 사용할 총 예산을 정해주세요."
        />
      </View>

      {/* 중앙 금액 표시 */}
      <View style={s.centerContent}>
        <CurrencyInlineInput
          value={isKeyboardMode ? keyboardValue : amount}
          onChange={handleKeyboardChange}
          onFocus={handleKeyboardStart}
        />
      </View>

      {/* 하단 슬라이더 */}
      <View style={s.bottomContent}>
        <AmountSlider
          value={amount}
          onChange={handleSliderChange}
          min={min}
          max={max}
          step={step}
        />
      </View>

      {/* 하단 내비게이션 (고정 단계) */}
      <BudgetWizardFooter
        stepIndex={0}
        stepTotal={5}
        onPressPrev={onPressPrev}
        onPressNext={onPressNext}
        nextDisabled={nextDisabled}
        baseBottom={FOOTER_BOTTOM}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND_PRIMARY,
    paddingTop: 32,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  bottomContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
});
