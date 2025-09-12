import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BudgetCopy from "~features/Budget/ui/molecules/BudgetCopy";
import CategoryGrid from "~features/Budget/ui/organisms/CategoryGrid";
import BudgetWizardFooter from "~features/Budget/ui/organisms/BudgetWizardFooter";
import { colors } from "@/shared/constants/colors";
import type { SelectCategoryTemplateProps } from "./types";

export default function SelectCategoryTemplate({
  title,
  subtitle,
  items,
  selectedKeys,
  onToggle,
  stepIndex,
  stepTotal,
  onPressPrev,
  onPressNext,
  nextDisabled,
}: SelectCategoryTemplateProps) {
  return (
    <SafeAreaView style={s.container} edges={["top", "bottom"]}>
      {/* 1) 상단 카피 (header) */}
      <View style={s.header}>
        <BudgetCopy title={title} subtitle={subtitle} />
      </View>

      {/* 2) 카테고리 그리드 영역 (centerContent 느낌, 화면을 채우는 본문) */}
      <View style={s.gridArea}>
        <CategoryGrid
          items={items}
          selectedKeys={selectedKeys}
          onToggle={onToggle}
        />
      </View>

      {/* 3) 푸터 (이전/점/다음) - 동일 좌표 고정 */}
      <BudgetWizardFooter
        stepIndex={stepIndex}
        stepTotal={stepTotal}
        onPressPrev={onPressPrev}
        onPressNext={onPressNext}
        nextDisabled={nextDisabled}
        baseBottom={LAYOUT.footerBaseBottom}
      />
    </SafeAreaView>
  );
}

const LAYOUT = {
  horizontal: 24,
  top: 40,
  gap: 16,
  footerBaseBottom: 32,
} as const;

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
  gridArea: {
    flex: 1,
    paddingHorizontal: 24,
    marginTop: 16,
  },
});
