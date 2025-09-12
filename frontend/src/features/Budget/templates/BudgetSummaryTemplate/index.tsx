import React from "react";
import { StyleSheet, Text, View, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BudgetSummaryHeaderRow from "~features/Budget/ui/molecules/BudgetSummaryHeaderRow";
import CategoryBudgetRow from "~features/Budget/ui/molecules/CategoryBudgetRow";
import FixedExpenseSummaryRow from "~features/Budget/ui/molecules/FixedExpenseSummaryRow";
import DividerDashed from "~features/Budget/ui/molecules/DividerDashed";
import BudgetWizardFooter from "~features/Budget/ui/organisms/BudgetWizardFooter";
import type { BudgetSummaryTemplateProps } from "./types";
import { colors } from "@/shared/constants/colors";
import { krw } from "@/shared/utils/currency";
import { CATEGORY_ICON_BY_NAME } from "@/shared/constants/categoryIcons";

export default function BudgetSummaryTemplate({
  month,
  totalBudget,
  variableBudget,
  fixedIncludedBudget,
  fixedExcludedBudget,
  categoryBudgets,
  fixedIncludedExpenses,
  fixedExcludedExpenses,
  onPressPrev,
  onPressNext,
  stepIndex,
  stepTotal,
  nextLabel = "확정",
}: BudgetSummaryTemplateProps) {
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* 캐릭터 이미지와 완료 문구 */}
      <View style={styles.header}>
        <Image
          source={require("@/assets/images/character/big-character-02.png")}
          style={styles.characterImage}
          resizeMode="contain"
        />
        <Text style={styles.completionText}>{month} 예산 설정 완료</Text>
      </View>

      {/* 스크롤 가능한 메인 콘텐츠 영역 */}
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 전체 예산 요약 */}
        <BudgetSummaryHeaderRow
          title={`${month} 예산`}
          amount={totalBudget}
        />

        {/* 변동 지출 예산 섹션 */}
        {variableBudget > 0 && (
          <View style={styles.section}>
            <BudgetSummaryHeaderRow
              title="변동 지출 예산"
              amount={variableBudget}
            />
            {categoryBudgets.map((item) => (
              <CategoryBudgetRow
                key={item.name}
                name={item.name}
                icon={CATEGORY_ICON_BY_NAME[item.name]}
                amount={item.amount}
                disabled={true}
              />
            ))}
          </View>
        )}

        {/* 고정 지출 (예산 포함) 섹션 */}
        {fixedIncludedBudget > 0 && (
          <View style={styles.section}>
            <BudgetSummaryHeaderRow
              title="고정 지출 (예산 포함)"
              amount={fixedIncludedBudget}
            />
            {fixedIncludedExpenses.map((item) => (
              <FixedExpenseSummaryRow
                key={item.id}
                item={item}
              />
            ))}
          </View>
        )}

        {/* 구분선 */}
        {(fixedIncludedBudget > 0 && fixedExcludedBudget > 0) && (
          <DividerDashed />
        )}

        {/* 고정 지출 (예산 미포함) 섹션 */}
        {fixedExcludedBudget > 0 && (
          <View style={styles.section}>
            <BudgetSummaryHeaderRow
              title="고정 지출 (예산 미포함)"
              amount={fixedExcludedBudget}
            />
            {fixedExcludedExpenses.map((item) => (
              <FixedExpenseSummaryRow
                key={item.id}
                item={item}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* 고정 푸터 */}
      <View style={styles.footerContainer}>
        <BudgetWizardFooter
          stepIndex={stepIndex}
          stepTotal={stepTotal}
          onPressPrev={onPressPrev}
          onPressNext={onPressNext}
          nextLabel={nextLabel}
          baseBottom={32}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND_PRIMARY,
  },
  header: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 24,
  },
  characterImage: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  completionText: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.GRAY_DARK,
    textAlign: "center",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    gap: 16,
  },
  section: {
    gap: 8,
  },
  footerContainer: {
    backgroundColor: colors.BACKGROUND_PRIMARY,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.GRAY_LIGHT,
  },
});
