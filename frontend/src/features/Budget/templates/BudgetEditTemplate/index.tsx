import { CATEGORY_ICON_BY_NAME } from "@/shared/constants/categoryIcons";
import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";
import { spacing, borderRadius, createButtonStyles, createTextStyles } from "@/shared/theme/styles";
import React, { useMemo, useEffect } from "react";
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BudgetSummaryHeaderRow from "~features/Budget/ui/molecules/BudgetSummaryHeaderRow";
import DividerDashed from "~features/Budget/ui/molecules/DividerDashed";
import EditableBudgetSummaryRow from "~features/Budget/ui/molecules/EditableBudgetSummaryRow";
import EditableCategoryBudgetRow from "~features/Budget/ui/molecules/EditableCategoryBudgetRow";
import EditableFixedExpenseRow from "~features/Budget/ui/molecules/EditableFixedExpenseRow";
import { ValidationSummary } from "@/shared/components/ValidationError";
import { validateBudgetSums } from "./validation";
import type { BudgetEditTemplateProps } from "./types";

export default function BudgetEditTemplate({
  month,
  totalBudget,
  variableBudget,
  fixedIncludedBudget,
  fixedExcludedBudget,
  categoryBudgets,
  fixedIncludedExpenses,
  fixedExcludedExpenses,
  onTotalBudgetChange,
  onVariableBudgetChange,
  onCategoryBudgetChange,
  onAddFixedExpense,
  onEditFixedExpense,
  onDeleteFixedExpense,
  onPressCancel,
  onPressSave,
  saveDisabled = false,
  saveButtonText = '수정 완료',
}: BudgetEditTemplateProps) {
  
  // 합계 유효성 검사
  const validationResult = useMemo(() => {
    return validateBudgetSums({
      totalBudget,
      variableBudget,
      fixedIncludedBudget,
      categoryBudgets
    });
  }, [totalBudget, variableBudget, fixedIncludedBudget, categoryBudgets]);
  
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* 고정 헤더 */}
      <View style={styles.header}>
        <Text style={styles.editText}>
          {month} 예산 편집
        </Text>
        {/* 유효성 검사 결과 표시 */}
        <ValidationSummary errors={validationResult.errors} />
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
        <View style={styles.section}>
          <BudgetSummaryHeaderRow
            title="변동 지출 예산"
            amount={variableBudget}
          />
          {categoryBudgets.map((item) => (
            <EditableCategoryBudgetRow
              key={item.name}
              name={item.name}
              icon={CATEGORY_ICON_BY_NAME[item.name]}
              amount={item.amount}
              onAmountChange={(amount) => onCategoryBudgetChange(item.name, amount)}
            />
          ))}
        </View>

        {/* 고정 지출 (예산 포함) 섹션 */}
        <View style={styles.section}>
          <BudgetSummaryHeaderRow
            title="고정 지출 (예산 포함)"
            amount={fixedIncludedBudget}
          />
          {fixedIncludedExpenses.map((item) => (
            <EditableFixedExpenseRow 
              key={item.id} 
              item={item}
              onEdit={() => onEditFixedExpense(item)}
              onDelete={() => onDeleteFixedExpense(item.id)}
            />
          ))}
          <TouchableOpacity 
            style={styles.addButton}
            onPress={onAddFixedExpense}
          >
            <Text style={styles.addButtonText}>+ 고정 지출 추가</Text>
          </TouchableOpacity>
        </View>

        {/* 구분선 */}
        <DividerDashed />

        {/* 고정 지출 (예산 미포함) 섹션 */}
        <View style={styles.section}>
          <BudgetSummaryHeaderRow
            title="고정 지출 (예산 미포함)"
            amount={fixedExcludedBudget}
          />
          {fixedExcludedExpenses.map((item) => (
            <EditableFixedExpenseRow 
              key={item.id} 
              item={item}
              onEdit={() => onEditFixedExpense(item)}
              onDelete={() => onDeleteFixedExpense(item.id)}
            />
          ))}
          <TouchableOpacity 
            style={styles.addButton}
            onPress={onAddFixedExpense}
          >
            <Text style={styles.addButtonText}>+ 고정 지출 추가</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 하단 버튼들 */}
      <View style={styles.footerContainer}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={onPressCancel}
          >
            <Text style={styles.cancelButtonText}>취소</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.saveButton, (saveDisabled || !validationResult.isValid) && styles.saveButtonDisabled]}
            onPress={onPressSave}
            disabled={saveDisabled || !validationResult.isValid}
          >
            <Text style={[styles.saveButtonText, (saveDisabled || !validationResult.isValid) && styles.saveButtonTextDisabled]}>
              {saveButtonText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}


const buttonStyles = createButtonStyles('lg');
const textStyles = createTextStyles();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND_PRIMARY,
  },
  header: {
    alignItems: "center",
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.BACKGROUND_PRIMARY,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  editText: {
    ...textStyles.h3,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  section: {
    gap: spacing.xs,
  },
  addButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: "#ffffff",
    borderRadius: borderRadius.md,
    alignItems: "center",
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.GRAY_LIGHT,
  },
  addButtonText: {
    ...textStyles.caption,
    color: colors.BLUE_NORMAL,
  },
  footerContainer: {
    backgroundColor: colors.BACKGROUND_PRIMARY,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.xxl,
    borderTopWidth: 1,
    borderTopColor: colors.GRAY_LIGHT,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    ...buttonStyles.base,
    ...buttonStyles.outline,
  },
  cancelButtonText: {
    ...textStyles.body,
    color: colors.GRAY_DARK,
  },
  saveButton: {
    flex: 1,
    ...buttonStyles.base,
    ...buttonStyles.primary,
  },
  saveButtonDisabled: {
    ...buttonStyles.disabled,
  },
  saveButtonText: {
    ...textStyles.body,
    ...font.bold,
    color: "#ffffff",
  },
  saveButtonTextDisabled: {
    color: colors.GRAY_DARK,
  },
});
